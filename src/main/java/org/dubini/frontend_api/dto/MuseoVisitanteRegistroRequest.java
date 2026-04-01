package org.dubini.frontend_api.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class MuseoVisitanteRegistroRequest {

    @NotBlank(message = "El nombre del representante es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[+0-9()\\-\\s]{7,20}$", message = "El teléfono no tiene un formato válido")
    private String telefono;

    @NotBlank(message = "El tipo de grupo/caridad es obligatorio")
    private String tipoCaridad;

    @NotNull(message = "El número de personas es obligatorio")
    private Integer numPersonas;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El rango horario es obligatorio")
    private String horaRango;

    @Size(max = 2000, message = "Los comentarios no pueden superar 2000 caracteres")
    private String comentarios;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getTipoCaridad() {
        return tipoCaridad;
    }

    public void setTipoCaridad(String tipoCaridad) {
        this.tipoCaridad = tipoCaridad;
    }

    public Integer getNumPersonas() {
        return numPersonas;
    }

    public void setNumPersonas(Integer numPersonas) {
        this.numPersonas = numPersonas;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getHoraRango() {
        return horaRango;
    }

    public void setHoraRango(String horaRango) {
        this.horaRango = horaRango;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }

    public void sanitize() {
        this.nombre = sanitizeText(this.nombre);
        this.tipoCaridad = sanitizeText(this.tipoCaridad);
        this.horaRango = sanitizeText(this.horaRango);
        this.comentarios = sanitizeText(this.comentarios);
    }

    private String sanitizeText(String text) {
        if (text == null) return null;
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
