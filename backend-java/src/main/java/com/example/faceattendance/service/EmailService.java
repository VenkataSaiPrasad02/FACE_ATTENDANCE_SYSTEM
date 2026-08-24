package com.example.faceattendance.service;

import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.Student;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd MMMM yyyy",
                    Locale.ENGLISH
            );

    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "hh:mm a",
                    Locale.ENGLISH
            );

    // ============================================================
    // LOGO (inline CID image)
    // ============================================================

    // Content-ID referenced by every template as: <img src="cid:faceAttendanceLogo" ...>
    private static final String LOGO_CID = "faceAttendanceLogo";

    // Classpath location -> place the PNG here in your project:
    // src/main/resources/static/email/face-attendance-logo.png
    // Maven packages everything under src/main/resources into the JAR root,
    // so at runtime (including on Railway) this resolves to
    // classpath:/static/email/face-attendance-logo.png regardless of OS or filesystem.
    private static final String LOGO_CLASSPATH_LOCATION =
            "static/email/face-attendance-logo.png";

    // Shared HTML snippet inserted at the top of every template, above the
    // existing colored header. This is the only structural addition made
    // to each email; no existing markup, colors, or spacing were changed.
    private static final String LOGO_HEADER_HTML = """
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
                <tr>
                    <td align="center" style="padding:18px 20px 0;">
                        <img src="cid:faceAttendanceLogo"
                             alt="Face Attendance System"
                             width="220"
                             style="display:block;width:220px;max-width:60%%;height:auto;border:0;outline:none;text-decoration:none;">
                    </td>
                </tr>
            </table>
            """;

    // ============================================================
    // PRESENT EMAIL
    // ============================================================

    public void sendAttendanceEmail(
            Student student,
            Attendance attendance,
            double attendancePercentage) {

        if (student.getEmail() == null
                || student.getEmail().isBlank()) {

            log.warn(
                    "Skipping attendance email. Student has no email: id={}",
                    student.getId()
            );

            return;
        }

        String performance =
                getPerformance(attendancePercentage);

        String performanceColor =
                getPerformanceColor(attendancePercentage);

        String performanceMessage =
                getPerformanceMessage(attendancePercentage);

        String html =
                buildAttendanceHtml(
                        student,
                        attendance,
                        attendancePercentage,
                        performance,
                        performanceColor,
                        performanceMessage
                );

        sendHtmlEmail(
                student.getEmail(),
                "Today's Attendance - "
                        + attendance.getStatus()
                        + " | "
                        + String.format(
                        Locale.ENGLISH,
                        "%.1f%%",
                        attendancePercentage
                ),
                html
        );

        log.info(
                "Attendance email sent: studentId={}, email={}, percentage={}",
                student.getId(),
                student.getEmail(),
                attendancePercentage
        );
    }

    // ============================================================
    // ABSENT EMAIL
    // ============================================================

    public void sendAbsentEmail(
            Student student,
            LocalDate date,
            double attendancePercentage) {

        if (student.getEmail() == null
                || student.getEmail().isBlank()) {

            log.warn(
                    "Skipping absent email. Student has no email: id={}",
                    student.getId()
            );

            return;
        }

        String performance =
                getPerformance(attendancePercentage);

        String performanceColor =
                getPerformanceColor(attendancePercentage);

        String performanceMessage =
                getPerformanceMessage(attendancePercentage);

        String html =
                buildAbsentHtml(
                        student,
                        date,
                        attendancePercentage,
                        performance,
                        performanceColor,
                        performanceMessage
                );

        sendHtmlEmail(
                student.getEmail(),
                "Today's Attendance - ABSENT | "
                        + String.format(
                        Locale.ENGLISH,
                        "%.1f%%",
                        attendancePercentage
                ),
                html
        );

        log.info(
                "Absent email sent: studentId={}, email={}, percentage={}",
                student.getId(),
                student.getEmail(),
                attendancePercentage
        );
    }

    // ============================================================
    // PRESENT HTML
    // ============================================================

    private String buildAttendanceHtml(
            Student student,
            Attendance attendance,
            double percentage,
            String performance,
            String performanceColor,
            String performanceMessage) {

        String percentageText =
                String.format(
                        Locale.ENGLISH,
                        "%.1f%%",
                        percentage
                );

        String date =
                attendance.getAttendanceDate()
                        .format(DATE_FORMATTER);

        String time =
                attendance.getAttendanceTime()
                        .format(TIME_FORMATTER);

        return ("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>Attendance Report</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f1f5f9;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">

                <div style="
                    max-width:650px;
                    margin:30px auto;
                    background:#ffffff;
                    border-radius:18px;
                    overflow:hidden;
                    box-shadow:0 12px 35px rgba(15,23,42,0.12);
                ">

                    """ + LOGO_HEADER_HTML + """

                    <!-- HEADER -->

                    <div style="
                        padding:32px 28px;
                        background:linear-gradient(
                            135deg,
                            #2563eb,
                            #4f46e5
                        );
                        color:#ffffff;
                    ">

                        <div style="
                            font-size:14px;
                            font-weight:bold;
                            letter-spacing:1px;
                            opacity:0.85;
                        ">
                            FACE ATTENDANCE SYSTEM
                        </div>

                        <h1 style="
                            margin:10px 0 5px;
                            font-size:28px;
                        ">
                            Daily Attendance Report
                        </h1>

                        <div style="
                            font-size:14px;
                            opacity:0.9;
                        ">
                            Your attendance update for today
                        </div>

                    </div>

                    <!-- GREETING -->

                    <div style="padding:28px;">

                        <div style="
                            font-size:20px;
                            font-weight:bold;
                            margin-bottom:8px;
                        ">
                            Hello %s 👋
                        </div>

                        <div style="
                            color:#64748b;
                            font-size:15px;
                            line-height:1.6;
                        ">
                            Here is your attendance status for
                            <strong>%s</strong>.
                        </div>

                    </div>

                    <!-- TODAY STATUS -->

                    <div style="
                        margin:0 28px;
                        padding:22px;
                        border-radius:14px;
                        background:#ecfdf5;
                        border:1px solid #bbf7d0;
                        text-align:center;
                    ">

                        <div style="
                            font-size:13px;
                            font-weight:bold;
                            color:#15803d;
                            letter-spacing:1px;
                        ">
                            TODAY'S STATUS
                        </div>

                        <div style="
                            margin-top:8px;
                            font-size:32px;
                            font-weight:bold;
                            color:#16a34a;
                        ">
                            ✓ PRESENT
                        </div>

                        <div style="
                            margin-top:6px;
                            font-size:14px;
                            color:#166534;
                        ">
                            Attendance recorded successfully
                        </div>

                    </div>

                    <!-- ATTENDANCE DETAILS -->

                    <div style="padding:28px;">

                        <div style="
                            font-size:17px;
                            font-weight:bold;
                            margin-bottom:15px;
                        ">
                            Attendance Details
                        </div>

                        <table style="
                            width:100%%;
                            border-collapse:collapse;
                        ">

                            <tr>

                                <td style="
                                    padding:12px 0;
                                    color:#64748b;
                                ">
                                    Date
                                </td>

                                <td style="
                                    padding:12px 0;
                                    text-align:right;
                                    font-weight:bold;
                                ">
                                    %s
                                </td>

                            </tr>

                            <tr>

                                <td style="
                                    padding:12px 0;
                                    color:#64748b;
                                ">
                                    Check-in Time
                                </td>

                                <td style="
                                    padding:12px 0;
                                    text-align:right;
                                    font-weight:bold;
                                ">
                                    %s
                                </td>

                            </tr>

                            <tr>

                                <td style="
                                    padding:12px 0;
                                    color:#64748b;
                                ">
                                    Today's Status
                                </td>

                                <td style="
                                    padding:12px 0;
                                    text-align:right;
                                    font-weight:bold;
                                    color:#16a34a;
                                ">
                                    PRESENT
                                </td>

                            </tr>

                        </table>

                    </div>

                    <!-- OVERALL ATTENDANCE -->

                    <div style="
                        margin:0 28px;
                        padding:25px;
                        border-radius:16px;
                        background:#f8fafc;
                        border:1px solid #e2e8f0;
                    ">

                        <div style="
                            font-size:14px;
                            color:#64748b;
                        ">
                            Overall Attendance
                        </div>

                        <div style="
                            margin-top:8px;
                            font-size:42px;
                            font-weight:bold;
                            color:%s;
                        ">
                            %s
                        </div>

                        <div style="
                            display:inline-block;
                            margin-top:8px;
                            padding:6px 12px;
                            border-radius:20px;
                            background:%s;
                            color:#ffffff;
                            font-size:12px;
                            font-weight:bold;
                        ">
                            %s
                        </div>

                        <!-- PROGRESS BAR -->

                        <div style="
                            margin-top:18px;
                            width:100%%;
                            height:10px;
                            background:#e2e8f0;
                            border-radius:10px;
                            overflow:hidden;
                        ">

                            <div style="
                                width:%s;
                                height:10px;
                                background:%s;
                                border-radius:10px;
                            ">
                            </div>

                        </div>

                        <div style="
                            margin-top:15px;
                            color:#475569;
                            font-size:14px;
                            line-height:1.6;
                        ">
                            %s
                        </div>

                    </div>

                    <!-- MOTIVATION -->

                    <div style="
                        margin:28px;
                        padding:20px;
                        border-radius:14px;
                        background:#eff6ff;
                        border-left:5px solid #2563eb;
                    ">

                        <div style="
                            font-size:15px;
                            font-weight:bold;
                            color:#1e40af;
                        ">
                            Keep going! 🚀
                        </div>

                        <div style="
                            margin-top:6px;
                            font-size:14px;
                            color:#475569;
                            line-height:1.6;
                        ">
                            Consistent attendance helps you stay
                            on track with your academic goals.
                        </div>

                    </div>

                    <!-- FOOTER -->

                    <div style="
                        padding:22px;
                        background:#f8fafc;
                        text-align:center;
                        color:#94a3b8;
                        font-size:12px;
                    ">
                        This is an automated message from
                        Face Attendance System.<br>
                        Please do not reply to this email.
                    </div>

                </div>

                </body>
                </html>
                """).formatted(
                student.getFullName(),
                date,
                date,
                time,
                performanceColor,
                percentageText,
                performanceColor,
                performance,
                percentage + "%",
                performanceColor,
                performanceMessage
        );
    }

    // ============================================================
    // ABSENT HTML
    // ============================================================

    private String buildAbsentHtml(
            Student student,
            LocalDate date,
            double percentage,
            String performance,
            String performanceColor,
            String performanceMessage) {

        String percentageText =
                String.format(
                        Locale.ENGLISH,
                        "%.1f%%",
                        percentage
                );

        String formattedDate =
                date.format(DATE_FORMATTER);

        return ("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f1f5f9;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">

                <div style="
                    max-width:650px;
                    margin:30px auto;
                    background:#ffffff;
                    border-radius:18px;
                    overflow:hidden;
                    box-shadow:0 12px 35px rgba(15,23,42,0.12);
                ">

                    """ + LOGO_HEADER_HTML + """

                    <!-- HEADER -->

                    <div style="
                        padding:32px 28px;
                        background:linear-gradient(
                            135deg,
                            #dc2626,
                            #ea580c
                        );
                        color:#ffffff;
                    ">

                        <div style="
                            font-size:14px;
                            font-weight:bold;
                            letter-spacing:1px;
                        ">
                            FACE ATTENDANCE SYSTEM
                        </div>

                        <h1 style="
                            margin:10px 0 5px;
                            font-size:28px;
                        ">
                            Attendance Alert
                        </h1>

                        <div style="
                            font-size:14px;
                            opacity:0.9;
                        ">
                            Daily attendance update
                        </div>

                    </div>

                    <!-- GREETING -->

                    <div style="padding:28px;">

                        <div style="
                            font-size:20px;
                            font-weight:bold;
                        ">
                            Hello %s 👋
                        </div>

                        <div style="
                            margin-top:8px;
                            color:#64748b;
                            font-size:15px;
                        ">
                            Your attendance report for
                            <strong>%s</strong>
                        </div>

                    </div>

                    <!-- ABSENT STATUS -->

                    <div style="
                        margin:0 28px;
                        padding:25px;
                        border-radius:16px;
                        text-align:center;
                        background:#fef2f2;
                        border:1px solid #fecaca;
                    ">

                        <div style="
                            font-size:13px;
                            font-weight:bold;
                            color:#b91c1c;
                            letter-spacing:1px;
                        ">
                            TODAY'S STATUS
                        </div>

                        <div style="
                            margin-top:8px;
                            font-size:34px;
                            font-weight:bold;
                            color:#dc2626;
                        ">
                            ✕ ABSENT
                        </div>

                        <div style="
                            margin-top:8px;
                            color:#991b1b;
                            font-size:14px;
                        ">
                            No attendance record was found today.
                        </div>

                    </div>

                    <!-- OVERALL ATTENDANCE -->

                    <div style="
                        margin:28px;
                        padding:25px;
                        border-radius:16px;
                        background:#f8fafc;
                        border:1px solid #e2e8f0;
                    ">

                        <div style="
                            color:#64748b;
                            font-size:14px;
                        ">
                            Overall Attendance
                        </div>

                        <div style="
                            margin-top:8px;
                            font-size:42px;
                            font-weight:bold;
                            color:%s;
                        ">
                            %s
                        </div>

                        <div style="
                            display:inline-block;
                            margin-top:8px;
                            padding:6px 12px;
                            border-radius:20px;
                            background:%s;
                            color:#ffffff;
                            font-size:12px;
                            font-weight:bold;
                        ">
                            %s
                        </div>

                        <!-- PROGRESS BAR -->

                        <div style="
                            margin-top:18px;
                            height:10px;
                            background:#e2e8f0;
                            border-radius:10px;
                            overflow:hidden;
                        ">

                            <div style="
                                width:%s;
                                height:10px;
                                background:%s;
                            ">
                            </div>

                        </div>

                        <div style="
                            margin-top:15px;
                            color:#475569;
                            font-size:14px;
                            line-height:1.6;
                        ">
                            %s
                        </div>

                    </div>

                    <!-- REMINDER -->

                    <div style="
                        margin:28px;
                        padding:20px;
                        border-radius:14px;
                        background:#fff7ed;
                        border-left:5px solid #f97316;
                    ">

                        <div style="
                            font-weight:bold;
                            color:#c2410c;
                        ">
                            Attendance Reminder ⚠️
                        </div>

                        <div style="
                            margin-top:6px;
                            color:#475569;
                            font-size:14px;
                            line-height:1.6;
                        ">
                            Please maintain regular attendance
                            to avoid falling behind academically.
                        </div>

                    </div>

                    <!-- FOOTER -->

                    <div style="
                        padding:22px;
                        background:#f8fafc;
                        text-align:center;
                        color:#94a3b8;
                        font-size:12px;
                    ">
                        Automated message from
                        Face Attendance System.
                    </div>

                </div>

                </body>
                </html>
                """).formatted(
                student.getFullName(),
                formattedDate,
                performanceColor,
                percentageText,
                performanceColor,
                performance,
                percentage + "%",
                performanceColor,
                performanceMessage
        );
    }

    // ============================================================
    // PERFORMANCE
    // ============================================================

    private String getPerformance(
            double percentage) {

        if (percentage >= 85) {
            return "EXCELLENT";
        }

        if (percentage >= 75) {
            return "GOOD";
        }

        return "NEEDS IMPROVEMENT";
    }

    private String getPerformanceColor(
            double percentage) {

        if (percentage >= 85) {
            return "#16a34a";
        }

        if (percentage >= 75) {
            return "#2563eb";
        }

        return "#dc2626";
    }

    private String getPerformanceMessage(
            double percentage) {

        if (percentage >= 85) {
            return "Excellent attendance! Keep maintaining this consistency. 🌟";
        }

        if (percentage >= 75) {
            return "Good attendance. Keep it consistent and aim even higher! 👍";
        }

        return "Your attendance needs improvement. Try to attend classes regularly. ⚠️";
    }

    // ============================================================
    // PASSWORD RESET OTP
    // ============================================================

    public void sendPasswordResetOtp(
            String username,
            String toEmail,
            String otp) {

        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "User does not have a registered email address"
            );
        }

        String html = ("""
                <!DOCTYPE html>
                <html>
                <body style="
                    margin:0;
                    padding:40px 20px;
                    background:#f1f5f9;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">
                    <div style="
                        max-width:560px;
                        margin:auto;
                        background:#ffffff;
                        border-radius:18px;
                        overflow:hidden;
                        box-shadow:0 12px 35px rgba(15,23,42,0.12);
                    ">
                        """ + LOGO_HEADER_HTML + """
                        <div style="
                            padding:28px;
                            background:linear-gradient(135deg,#2563eb,#4f46e5);
                            color:#ffffff;
                        ">
                            <div style="font-size:13px;font-weight:bold;letter-spacing:1px;">
                                FACE ATTENDANCE SYSTEM
                            </div>
                            <h1 style="margin:10px 0 0;font-size:27px;">
                                Password Reset
                            </h1>
                        </div>
                        <div style="padding:30px;">
                            <p style="font-size:18px;font-weight:bold;">
                                Hello %s 👋
                            </p>
                            <p style="color:#64748b;line-height:1.6;">
                                We received a request to reset the password for your account.
                            </p>
                            <div style="
                                margin:25px 0;
                                padding:18px;
                                border-radius:12px;
                                background:#eff6ff;
                                text-align:center;
                            ">
                                <div style="color:#64748b;font-size:12px;font-weight:bold;">
                                    YOUR OTP
                                </div>
                                <div style="
                                    margin-top:8px;
                                    color:#2563eb;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:7px;
                                ">
                                    %s
                                </div>
                            </div>
                            <p style="color:#64748b;">
                                This OTP is valid for <b>2 minutes</b>.
                            </p>
                            <p style="color:#94a3b8;font-size:13px;">
                                Do not share this OTP with anyone. If you did not request a
                                password reset, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """).formatted(username, otp);

        sendHtmlEmail(
                toEmail,
                "Password Reset OTP | Face Attendance System",
                html
        );
    }

    // ============================================================
    // LOGIN OTP (2FA)
    // ============================================================

    public void sendLoginOtp(
            String username,
            String toEmail,
            String otp) {

        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "User does not have a registered email address"
            );
        }

        String html = ("""
                <!DOCTYPE html>
                <html>
                <body style="
                    margin:0;
                    padding:40px 20px;
                    background:#f1f5f9;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#172033;
                ">
                    <div style="
                        max-width:560px;
                        margin:auto;
                        background:#ffffff;
                        border-radius:18px;
                        overflow:hidden;
                        box-shadow:0 12px 35px rgba(15,23,42,0.12);
                    ">
                        """ + LOGO_HEADER_HTML + """
                        <div style="
                            padding:28px;
                            background:linear-gradient(135deg,#2563eb,#4f46e5);
                            color:#ffffff;
                        ">
                            <div style="font-size:13px;font-weight:bold;letter-spacing:1px;">
                                FACE ATTENDANCE SYSTEM
                            </div>
                            <h1 style="margin:10px 0 0;font-size:27px;">
                                Login Verification
                            </h1>
                        </div>
                        <div style="padding:30px;">
                            <p style="font-size:18px;font-weight:bold;">
                                Hello %s 👋
                            </p>
                            <p style="color:#64748b;line-height:1.6;">
                                We received a sign-in request for your account. Use the code below to complete your login.
                            </p>
                            <div style="
                                margin:25px 0;
                                padding:18px;
                                border-radius:12px;
                                background:#eff6ff;
                                text-align:center;
                            ">
                                <div style="color:#64748b;font-size:12px;font-weight:bold;">
                                    YOUR LOGIN OTP
                                </div>
                                <div style="
                                    margin-top:8px;
                                    color:#2563eb;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:7px;
                                ">
                                    %s
                                </div>
                            </div>
                            <p style="color:#64748b;">
                                This OTP is valid for <b>2 minutes</b>.
                            </p>
                            <p style="color:#94a3b8;font-size:13px;">
                                Do not share this OTP with anyone. If you did not attempt to log in,
                                please secure your account immediately.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """).formatted(username, otp);

        sendHtmlEmail(
                toEmail,
                "Login OTP | Face Attendance System",
                html
        );
    }

    // ============================================================
    // SEND HTML EMAIL (now attaches the inline logo for every email)
    // ============================================================

    private void sendHtmlEmail(
            String recipient,
            String subject,
            String html) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            // MULTIPART_MODE_RELATED is required (not plain "true"/MIXED) so that
            // Gmail and other clients render the inline image next to the HTML
            // instead of showing it as a separate attachment.
            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            MimeMessageHelper.MULTIPART_MODE_RELATED,
                            "UTF-8"
                    );

            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);

            attachLogoIfAvailable(helper, recipient);

            // [ATTENDANCE EMAIL] 7. Email constructed + handoff to JavaMail/SMTP
            log.info(
                    "[ATTENDANCE EMAIL] 6-7. Email constructed, handing off to SMTP: "
                            + "to={}, subject={}",
                    recipient,
                    subject
            );

            mailSender.send(message);

            // [ATTENDANCE EMAIL] 8. Email send successful
            log.info(
                    "[ATTENDANCE EMAIL] 8. SMTP send successful: to={}",
                    recipient
            );

        } catch (MessagingException exception) {

            log.error(
                    "Failed to create HTML email for {}",
                    recipient,
                    exception
            );

            throw new RuntimeException(
                    "Failed to create attendance email",
                    exception
            );
        } catch (RuntimeException exception) {

            // org.springframework.mail.MailException (and anything else the
            // sender throws) — log with the FULL cause chain here as well so
            // a scheduled-task failure always shows the real SMTP error.
            log.error(
                    "[ATTENDANCE EMAIL] SMTP send FAILED for {}: {}",
                    recipient,
                    exception.getMessage(),
                    exception
            );

            throw exception;
        }
    }

    // ============================================================
    // LOGO ATTACHMENT (fails soft — see explanation below)
    // ============================================================

    private void attachLogoIfAvailable(
            MimeMessageHelper helper,
            String recipient) {

        try {

            Resource logo =
                    new ClassPathResource(LOGO_CLASSPATH_LOCATION);

            if (!logo.exists()) {
                log.warn(
                        "Logo resource not found on classpath at '{}'. "
                                + "Sending email to {} without the logo.",
                        LOGO_CLASSPATH_LOCATION,
                        recipient
                );
                return;
            }

            helper.addInline(LOGO_CID, logo);

        } catch (MessagingException exception) {

            // Deliberately NOT rethrown: a missing/broken logo must never
            // block delivery of an attendance report or an OTP email.
            log.warn(
                    "Could not attach inline logo for email to {}. "
                            + "Sending without logo. Reason: {}",
                    recipient,
                    exception.getMessage()
            );
        }
    }
}