package co.kr.deleo.admin.base.exception;

import org.springframework.context.MessageSource;

import java.text.MessageFormat;
import java.util.Locale;

public class BizException extends Exception {
    private static final long serialVersionUID = 1L;

    protected String message;
    protected String messageKey;
    protected Object[] messageParameters;
    protected Exception wrappedException;

    @Override
    public String getMessage() {
        return this.message;
    }

    public BizException() {
        this("BizException without message");
    }

    public BizException(String defaultMessage) {
        this(defaultMessage, null);
    }
    public BizException(String defaultMessage, Object[] messageParameters) {
        this(defaultMessage, messageParameters, null);
    }

    public BizException(String defaultMessage, Object[] messageParameters, Exception wrappedException) {
        this.message = defaultMessage;
        this.wrappedException = wrappedException;
        if (messageParameters != null) {
            this.message = MessageFormat.format(defaultMessage, messageParameters);
        }
    }

    public BizException(MessageSource messageSource, String messageKey) {
        this(messageSource, messageKey, null);
    }

    public BizException(MessageSource messageSource, String messageKey, Object[] messageParameters) {
        this(messageSource, messageKey, messageParameters, null);
    }

    public BizException(MessageSource messageSource, String messageKey, Object[] messageParameters, Exception wrappedException) {
        this(messageSource, messageKey, messageParameters, null, wrappedException);
    }

    public BizException(MessageSource messageSource, String messageKey, Object[] messageParameters, String defaultMessage, Exception wrappedException) {
        this(messageSource, messageKey, messageParameters, defaultMessage, Locale.getDefault(), wrappedException);
    }

    public BizException(MessageSource messageSource, String messageKey, Object[] messageParameters, String defaultMessage, Locale locale, Exception wrappedException) {
        super(wrappedException);
        this.messageKey = messageKey;
        this.messageParameters = messageParameters;
        this.message = messageSource.getMessage(messageKey, messageParameters, defaultMessage, locale);
        this.wrappedException = wrappedException;
    }


}

