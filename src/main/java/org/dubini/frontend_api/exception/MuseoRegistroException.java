package org.dubini.frontend_api.exception;

public class MuseoRegistroException extends RuntimeException {

    public MuseoRegistroException(String message) {
        super(message);
    }

    public MuseoRegistroException(String message, Throwable cause) {
        super(message, cause);
    }
}
