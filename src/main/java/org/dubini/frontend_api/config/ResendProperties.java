package org.dubini.frontend_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "resend")
public class ResendProperties {

    private String mail;
    private String associationEmail;
    private String associationEmail2;

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getAssociationEmail() {
        return associationEmail;
    }

    public void setAssociationEmail(String associationEmail) {
        this.associationEmail = associationEmail;
    }

    public String getAssociationEmail2() {
        return associationEmail2;
    }

    public void setAssociationEmail2(String associationEmail2) {
        this.associationEmail2 = associationEmail2;
    }
}