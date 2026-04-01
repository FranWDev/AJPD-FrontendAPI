package org.dubini.frontend_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre es demasiado largo")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "El asunto es obligatorio")
    @Size(max = 150, message = "El asunto es demasiado largo")
    private String asunto;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 2000, message = "El mensaje es demasiado largo (máximo 2000 caracteres)")
    private String mensaje;

    @Size(max = 20, message = "El teléfono es demasiado largo")
    private String telefono;

    public void sanitize() {
        this.nombre = sanitizeText(this.nombre);
        this.asunto = sanitizeText(this.asunto);
        this.mensaje = sanitizeText(this.mensaje);
        this.telefono = sanitizeText(this.telefono);
    }

    private String sanitizeText(String text) {
        if (text == null) return null;
        return text.replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;")
                   .replace("&", "&amp;");
    }
}
