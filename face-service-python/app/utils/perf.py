"""
Temporary performance-measurement helper for the Python face service.

WHAT THIS MEASURES AND WHY:

- TIME: time.perf_counter() — a monotonic timer, not wall-clock. Correct
  choice for measuring durations, per the same reasoning as the Java side.

- CPU: psutil.Process(pid).cpu_times() gives cumulative PROCESS CPU time
  (user + system seconds) consumed by this process since it started, same
  category of measurement as Java's OperatingSystemMXBean#getProcessCpuTime().
  It is NOT psutil.cpu_percent() at the system level, and it is NOT an
  instantaneous reading — we snapshot cpu_times() before and after an
  operation and derive a percentage from the delta, exactly like the Java
  PerfMonitor does. This is deliberate: psutil.Process.cpu_percent() without
  an interval returns a near-meaningless value based on time since the last
  call (which may be irrelevant to the operation just measured), and with an
  interval it BLOCKS for that whole interval, which would distort the very
  timing we're trying to measure. Before/after cpu_times() avoids both
  problems.

  LIMITATION: like the JVM, OS-level CPU time accounting has a practical
  resolution floor (commonly ~1ms, sometimes coarser depending on platform).
  For very fast operations, the delta can read as 0 even though real CPU
  work happened. We report that explicitly rather than printing a fake 0.0%.

  This process is CPU-bound during face detection/embedding (InsightFace
  ONNX inference), so process CPU time is meaningful here — unlike, say, an
  operation that's mostly waiting on network I/O, where CPU% will correctly
  look low even though wall-clock time is high. Worth keeping both numbers
  in view rather than either alone.

- MEMORY: psutil.Process(pid).memory_info().rss — resident set size, i.e.
  actual physical memory the process is using, sampled before/after.
  CAVEAT: Python's own garbage collector and NumPy/OpenCV's internal buffer
  reuse can both cause this number to go up, stay flat, or even drop after
  an operation that clearly did work — a single reading is indicative, not
  precise. This is the same caveat as the JVM heap numbers on the Java side.

Everything here is gated by settings.PERFORMANCE_MONITORING. When disabled,
calling these functions does nothing beyond a boolean check.
"""

import logging
import os
import time
from dataclasses import dataclass
from typing import Optional

import psutil

from app.core.config import settings

logger = logging.getLogger(__name__)

_process = psutil.Process(os.getpid())
_cpu_count = psutil.cpu_count() or 1


@dataclass
class Snapshot:
    wall_time: float
    cpu_time_total: float  # user + system seconds, cumulative since process start
    rss_mb: float


def start() -> Optional[Snapshot]:
    """Begin measuring. Returns None (do-nothing sentinel) when monitoring is off."""
    if not settings.PERFORMANCE_MONITORING:
        return None
    cpu = _process.cpu_times()
    mem = _process.memory_info()
    return Snapshot(
        wall_time=time.perf_counter(),
        cpu_time_total=cpu.user + cpu.system,
        rss_mb=mem.rss / (1024 * 1024),
    )


def stop(label: str, snap: Optional[Snapshot]) -> None:
    """Finish measuring and print a single [PERF] line. No-op if snap is None."""
    if not settings.PERFORMANCE_MONITORING or snap is None:
        return

    duration_ms = (time.perf_counter() - snap.wall_time) * 1000

    cpu_now = _process.cpu_times()
    mem_now = _process.memory_info()
    cpu_delta_s = (cpu_now.user + cpu_now.system) - snap.cpu_time_total
    rss_after_mb = mem_now.rss / (1024 * 1024)
    rss_delta_mb = rss_after_mb - snap.rss_mb

    if duration_ms < 2.0:
        cpu_part = f"~{cpu_delta_s * 1000:.2f}ms CPU (interval too short for a reliable %)"
    else:
        cpu_pct_of_one_core = (cpu_delta_s * 1000 / duration_ms) * 100.0
        cpu_pct_of_all_cores = cpu_pct_of_one_core / _cpu_count
        cpu_part = (
            f"{cpu_pct_of_one_core:.1f}% of 1 core "
            f"({cpu_pct_of_all_cores:.1f}% of {_cpu_count} cores) "
            f"[process CPU time, interval-based]"
        )

    sign = "+" if rss_delta_mb >= 0 else ""
    logger.info(
        "[PERF] %s : %.2f ms | CPU: %s | RSS: %.1f MB -> %.1f MB (delta %s%.1f MB)",
        label, duration_ms, cpu_part, snap.rss_mb, rss_after_mb, sign, rss_delta_mb,
    )


def log_duration(label: str, start_time: float) -> None:
    """Print just a duration, when you already have a perf_counter() start value."""
    if not settings.PERFORMANCE_MONITORING:
        return
    ms = (time.perf_counter() - start_time) * 1000
    logger.info("[PERF] %s : %.2f ms", label, ms)


def log_info(message: str, *args) -> None:
    """Print an arbitrary [PERF] info line (sizes, dimensions, etc.), gated by the flag."""
    if not settings.PERFORMANCE_MONITORING:
        return
    logger.info("[PERF] " + message, *args)
