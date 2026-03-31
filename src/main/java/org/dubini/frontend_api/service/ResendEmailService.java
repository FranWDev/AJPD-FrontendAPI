package org.dubini.frontend_api.service;

import java.nio.charset.StandardCharsets;

import org.dubini.frontend_api.config.ResendProperties;
import org.dubini.frontend_api.dto.MuseoVisitanteRegistroRequest;
import org.dubini.frontend_api.exception.MuseoRegistroException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.internet.MimeMessage;

@Service
public class ResendEmailService {

    private static final String NO_COMMENTS = "Sin comentarios";
    private static final String SENDER_NAME = "Asociación Juvenil Proyecto Dubini";

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final ResendProperties resendProperties;

    public ResendEmailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine,
            ResendProperties resendProperties) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.resendProperties = resendProperties;
    }

    public void enviarRegistroMuseo(MuseoVisitanteRegistroRequest solicitud) {
        validarConfiguracion();
        String comentarios = normalizarComentarios(solicitud.getComentarios());

        Context context = new Context();
        context.setVariable("nombre", solicitud.getNombre());
        context.setVariable("email", solicitud.getEmail());
        context.setVariable("telefono", solicitud.getTelefono());
        context.setVariable("tipoCaridad", solicitud.getTipoCaridad());
        context.setVariable("numPersonas", solicitud.getNumPersonas());
        context.setVariable("fecha", solicitud.getFecha().toString());
        context.setVariable("horaRango", solicitud.getHoraRango());
        context.setVariable("comentarios", comentarios);

        String htmlNotificacion = templateEngine.process("emails/museo-registro-notificacion", context);
        String htmlConfirmacion = templateEngine.process("emails/museo-registro-confirmacion", context);

        enviarCorreoHtml(resendProperties.getAssociationEmail(), "Nueva inscripción Museo Escolar", htmlNotificacion);
        if (resendProperties.getAssociationEmail2() != null && !resendProperties.getAssociationEmail2().isBlank()) {
            enviarCorreoHtml(resendProperties.getAssociationEmail2(), "Nueva inscripción Museo Escolar", htmlNotificacion);
        }
        enviarCorreoHtml(solicitud.getEmail(), "Confirmación de inscripción - Museo Escolar", htmlConfirmacion);
    }

    private void enviarCorreoHtml(String destinatario, String asunto, String html) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());
            helper.setFrom(resendProperties.getMail(), SENDER_NAME);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(mimeMessage);
        } catch (Exception exception) {
            throw new MuseoRegistroException("No se pudo procesar el envío de la solicitud.", exception);
        }
    }

    private String normalizarComentarios(String comentarios) {
        if (comentarios == null || comentarios.isBlank()) {
            return NO_COMMENTS;
        }
        return comentarios.trim();
    }

    private void validarConfiguracion() {
        if (resendProperties.getMail() == null || resendProperties.getMail().isBlank()) {
            throw new MuseoRegistroException("La propiedad resend.mail no está configurada.");
        }
        if (resendProperties.getAssociationEmail() == null || resendProperties.getAssociationEmail().isBlank()) {
            throw new MuseoRegistroException("La propiedad resend.association-email no está configurada.");
        }
    }
}