package co.kr.deleo.admin.base.exception;

import org.springframework.security.core.AuthenticationException;

public class IpAccessDeniedException extends AuthenticationException {
    public IpAccessDeniedException() {
        super("");
    }

    public IpAccessDeniedException(String msg, Throwable t) {
        super(msg, t);
    }

    public IpAccessDeniedException(String msg) {
        super(msg);
    }
}
