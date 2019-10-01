package co.kr.deleo.admin.base.exception;

public class SessionExpiredException extends Exception {

    public SessionExpiredException() {
        super("Session expired exception...");
    }
}
