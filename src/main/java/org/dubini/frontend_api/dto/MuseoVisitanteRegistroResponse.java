package org.dubini.frontend_api.dto;

public class MuseoVisitanteRegistroResponse {

    private String nombre;
    private String email;
    private String telefono;
    private String tipoCaridad;
    private Integer numPersonas;
    private String fecha;
    private String horaRango;

    public MuseoVisitanteRegistroResponse(String nombre, String email, String telefono, String tipoCaridad, 
            Integer numPersonas, String fecha, String horaRango) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.tipoCaridad = tipoCaridad;
        this.numPersonas = numPersonas;
        this.fecha = fecha;
        this.horaRango = horaRango;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getTipoCaridad() {
        return tipoCaridad;
    }

    public Integer getNumPersonas() {
        return numPersonas;
    }

    public String getFecha() {
        return fecha;
    }

    public String getHoraRango() {
        return horaRango;
    }
}
