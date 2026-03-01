package org.dubini.frontend_api.service;

import java.time.LocalDate;

import org.dubini.frontend_api.dto.MuseoVisitanteRegistroRequest;
import org.dubini.frontend_api.dto.MuseoVisitanteRegistroResponse;
import org.dubini.frontend_api.exception.MuseoRegistroException;
import org.springframework.stereotype.Service;

@Service
public class MuseoRegistroService {

    private final ResendEmailService resendEmailService;
    private final RateLimiterService rateLimiterService;

    public MuseoRegistroService(ResendEmailService resendEmailService, RateLimiterService rateLimiterService) {
        this.resendEmailService = resendEmailService;
        this.rateLimiterService = rateLimiterService;
    }

    public MuseoVisitanteRegistroResponse registrarVisitante(MuseoVisitanteRegistroRequest solicitud, String clientIp) {
        validarSolicitudCompleta(solicitud);
        validarRateLimit(clientIp);
        resendEmailService.enviarRegistroMuseo(solicitud);
        rateLimiterService.recordRequest(clientIp);
        return new MuseoVisitanteRegistroResponse(
                solicitud.getNombre().trim(),
                solicitud.getEmail().trim(),
                solicitud.getTelefono().trim(),
                solicitud.getTipoCaridad().trim(),
                solicitud.getNumPersonas(),
                solicitud.getFecha().toString(),
                solicitud.getHoraRango().trim());
    }

    private void validarSolicitudCompleta(MuseoVisitanteRegistroRequest solicitud) {
        if (solicitud == null) {
            throw new MuseoRegistroException("No se recibió información para registrar la visita.");
        }

        validarTexto(solicitud.getEmail(), "email");
        validarTexto(solicitud.getTelefono(), "teléfono");
        validarTexto(solicitud.getHoraRango(), "rango horario");

        LocalDate fecha = solicitud.getFecha();
        if (fecha == null) {
            throw new MuseoRegistroException("La fecha de visita es obligatoria.");
        }
        if (fecha.isBefore(LocalDate.now())) {
            throw new MuseoRegistroException("La fecha de visita no puede ser anterior al día actual.");
        }
    }

    private void validarTexto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new MuseoRegistroException("El campo " + campo + " es obligatorio.");
        }
    }

    private void validarRateLimit(String ip) {
        if (!rateLimiterService.canMakeRequest(ip)) {
            throw new MuseoRegistroException(rateLimiterService.getRateLimitMessage());
        }
    }
}
