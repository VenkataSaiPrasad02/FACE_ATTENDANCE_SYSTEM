package com.example.faceattendance.util;

import com.sun.management.OperatingSystemMXBean;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;

/**
 * Temporary performance-measurement helper.
 *
 * WHAT THIS MEASURES AND WHY:
 *
 * - TIME: System.nanoTime() — a monotonic timer, unaffected by wall-clock
 *   adjustments (NTP, DST, etc.). This is what should always be used to
 *   measure a duration; LocalDateTime/currentTimeMillis() should not.
 *
 * - CPU: this measures PROCESS CPU TIME (OperatingSystemMXBean#getProcessCpuTime()),
 *   which is the total CPU time (in nanoseconds) consumed by THIS JVM process
 *   since it started, on ALL cores combined. It is NOT system-wide CPU load,
 *   and it is NOT the instantaneous CPU percentage you'd see in a task manager.
 *
 *   To get a per-operation "CPU usage %" we take the DIFFERENCE in process CPU
 *   time across the operation (endCpuTime - startCpuTime), divide by the
 *   operation's wall-clock duration, and divide again by the number of
 *   available cores — i.e. "what fraction of one core, on average, was this
 *   process actively executing on, during this specific interval". This is
 *   deliberately NOT OperatingSystemMXBean#getProcessCpuLoad(), which reports
 *   a recent rolling average maintained internally by the JVM/OS and is not
 *   tied to an exact interval — for a call that takes a few milliseconds,
 *   getProcessCpuLoad() would give you a number describing some other,
 *   unrelated recent window, which would be actively misleading here.
 *
 *   LIMITATION: getProcessCpuTime() has limited resolution on some platforms
 *   (often ~1ms granularity). For operations under ~1-2ms, the CPU delta may
 *   read as exactly 0 even though real work happened — that's a measurement
 *   floor, not a claim that zero CPU was used. This code reports "&lt;1ms
 *   resolution" in that case instead of printing a fake 0.0%.
 *
 * - MEMORY: Runtime.getRuntime() heap usage (totalMemory() - freeMemory()),
 *   sampled immediately before and after the operation. This is JVM HEAP
 *   memory, not native/RSS memory. IMPORTANT CAVEAT: the JVM garbage collector
 *   can run at any time, including in the middle of the measured operation,
 *   which can make the "after" reading lower than the "before" reading, or
 *   make an unrelated operation look like it freed memory it never touched.
 *   Heap deltas from a single sample are indicative, not precise — the
 *   "average over 10-20 runs" step in the testing instructions matters much
 *   more for this number than for the timing numbers.
 *
 * Controlled entirely by `performance.monitoring` (default false). When
 * disabled, this class does no measurement work at all beyond a single
 * boolean check, and prints nothing.
 */
@Slf4j
@Component
public class PerfMonitor {

    private final boolean enabled;
    private final OperatingSystemMXBean osBean;

    public PerfMonitor(@Value("${performance.monitoring:false}") boolean enabled) {
        this.enabled = enabled;
        OperatingSystemMXBean bean = null;
        try {
            bean = ManagementFactory.getPlatformMXBean(OperatingSystemMXBean.class);
        } catch (Exception e) {
            log.warn("[PERF] com.sun.management.OperatingSystemMXBean unavailable on this JVM; " +
                    "CPU measurements will be skipped: {}", e.getMessage());
        }
        this.osBean = bean;
        if (enabled) {
            log.info("[PERF] Performance monitoring ENABLED (performance.monitoring=true)");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** Snapshot taken at the start of a measured operation. Immutable, cheap. */
    public static final class Snapshot {
        private final long nanoTime;
        private final long processCpuTimeNanos; // -1 if unavailable
        private final long usedHeapBytes;

        private Snapshot(long nanoTime, long processCpuTimeNanos, long usedHeapBytes) {
            this.nanoTime = nanoTime;
            this.processCpuTimeNanos = processCpuTimeNanos;
            this.usedHeapBytes = usedHeapBytes;
        }
    }

    /**
     * Starts measuring. Returns null when monitoring is disabled — callers should
     * treat a null snapshot as "do nothing" (see {@link #stop(String, Snapshot)}).
     */
    public Snapshot start() {
        if (!enabled) {
            return null;
        }
        long cpu = (osBean != null) ? osBean.getProcessCpuTime() : -1;
        Runtime rt = Runtime.getRuntime();
        long heap = rt.totalMemory() - rt.freeMemory();
        return new Snapshot(System.nanoTime(), cpu, heap);
    }

    /**
     * Stops measuring and logs a single [PERF] line for {@code label}.
     * No-op if monitoring is disabled or {@code snapshot} is null.
     */
    public void stop(String label, Snapshot snapshot) {
        if (!enabled || snapshot == null) {
            return;
        }

        long endNano = System.nanoTime();
        double durationMs = (endNano - snapshot.nanoTime) / 1_000_000.0;

        Runtime rt = Runtime.getRuntime();
        long endHeap = rt.totalMemory() - rt.freeMemory();
        double heapBeforeMb = snapshot.usedHeapBytes / (1024.0 * 1024.0);
        double heapAfterMb = endHeap / (1024.0 * 1024.0);
        double heapDeltaMb = heapAfterMb - heapBeforeMb;

        String cpuPart;
        if (osBean != null && snapshot.processCpuTimeNanos >= 0) {
            long endCpu = osBean.getProcessCpuTime();
            if (endCpu < 0) {
                cpuPart = "n/a";
            } else {
                double cpuMs = (endCpu - snapshot.processCpuTimeNanos) / 1_000_000.0;
                if (durationMs < 2.0) {
                    // Below the reliable resolution floor of getProcessCpuTime() on
                    // most JVMs — report that plainly instead of a misleading 0.0%.
                    cpuPart = String.format("~%.2fms CPU (interval too short for a reliable %%)", cpuMs);
                } else {
                    int cores = Math.max(1, osBean.getAvailableProcessors());
                    double cpuPercentOfOneCore = (cpuMs / durationMs) * 100.0;
                    double cpuPercentOfAllCores = cpuPercentOfOneCore / cores;
                    cpuPart = String.format("%.1f%% of 1 core (%.1f%% of %d cores) [process CPU time, interval-based]",
                            cpuPercentOfOneCore, cpuPercentOfAllCores, cores);
                }
            }
        } else {
            cpuPart = "n/a (OperatingSystemMXBean unavailable)";
        }

        log.info("[PERF] {} : {} ms | CPU: {} | Heap: {} MB -> {} MB (delta {}{} MB)",
                label,
                String.format("%.2f", durationMs),
                cpuPart,
                String.format("%.1f", heapBeforeMb),
                String.format("%.1f", heapAfterMb),
                heapDeltaMb >= 0 ? "+" : "",
                String.format("%.1f", heapDeltaMb));
    }

    /** Logs a plain [PERF] line with just a duration, when you already have a nanoTime start. */
    public void logDuration(String label, long startNanoTime) {
        if (!enabled) {
            return;
        }
        double ms = (System.nanoTime() - startNanoTime) / 1_000_000.0;
        log.info("[PERF] {} : {} ms", label, String.format("%.2f", ms));
    }

    /** Logs an arbitrary pre-formatted [PERF] info line (sizes, dimensions, etc.), gated by the flag. */
    public void logInfo(String message, Object... args) {
        if (!enabled) {
            return;
        }
        log.info("[PERF] " + message, args);
    }
}
