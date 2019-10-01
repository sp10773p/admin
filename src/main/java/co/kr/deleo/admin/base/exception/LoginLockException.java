package co.kr.deleo.admin.base.exception;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class LoginLockException extends UsernameNotFoundException {
    public LoginLockException(String msg) {
        super(msg);
    }

    public LoginLockException(String msg, Throwable t) {
        super(msg, t);
    }
}
