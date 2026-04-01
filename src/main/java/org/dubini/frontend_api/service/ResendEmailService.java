package org.dubini.frontend_api.service;



import org.dubini.frontend_api.config.ResendProperties;
import org.dubini.frontend_api.dto.ContactRequest;
import org.dubini.frontend_api.dto.MuseoVisitanteRegistroRequest;
import org.dubini.frontend_api.exception.MuseoRegistroException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResendEmailService {

    private static final String NO_COMMENTS = "Sin comentarios";
    private static final String SENDER_NAME = "Asociación Juvenil Proyecto Dubini";

    private final SpringTemplateEngine templateEngine;
    private final ResendProperties resendProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public ResendEmailService(SpringTemplateEngine templateEngine,
            ResendProperties resendProperties) {
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

    public void enviarEmailContacto(ContactRequest solicitud) {
        validarConfiguracion();

        Context context = new Context();
        context.setVariable("nombre", solicitud.getNombre());
        context.setVariable("email", solicitud.getEmail());
        context.setVariable("asunto", solicitud.getAsunto());
        context.setVariable("mensaje", solicitud.getMensaje());

        String htmlContacto = templateEngine.process("emails/contact-form", context);
        String htmlConfirmacion = templateEngine.process("emails/contact-confirmation", context);

        // Enviar notificación a la asociación (solo al primero como se solicitó)
        enviarCorreoHtml(resendProperties.getAssociationEmail(), "Nuevo contacto: " + solicitud.getAsunto(), htmlContacto);
        
        // Enviar confirmación al remitente
        enviarCorreoHtml(solicitud.getEmail(), "Hemos recibido tu mensaje - AJPD", htmlConfirmacion);
    }

    private void enviarCorreoHtml(String destinatario, String asunto, String html) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendProperties.getApiKey());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", SENDER_NAME + " <" + resendProperties.getMail() + ">");
            requestBody.put("to", new String[]{destinatario});
            requestBody.put("subject", asunto);
            requestBody.put("html", html);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", entity, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new MuseoRegistroException("Error en la API de Resend: " + response.getStatusCode());
            }
        } catch (Exception exception) {
            throw new MuseoRegistroException("No se pudo procesar el envío de la solicitud.");
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