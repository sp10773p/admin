package co.kr.deleo.admin.base.exception;

import org.springframework.security.core.AuthenticationException;

public class RequestOtpCheckException extends AuthenticationException {
    public RequestOtpCheckException() {
        super("");
    }

    public RequestOtpCheckException(String msg, Throwable t) {
        super(msg, t);
    }

    public RequestOtpCheckException(String msg) {
        super(msg);
    }
}
