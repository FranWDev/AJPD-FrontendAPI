package org.dubini.frontend_api.exception;

public class BackofficeException extends RuntimeException {
    public BackofficeException(String message) {
        super(message);
    }

    public BackofficeException(String message, Throwable cause) {
        super(message, cause);
    }
}
