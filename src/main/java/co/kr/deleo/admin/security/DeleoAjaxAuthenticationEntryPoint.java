package co.kr.deleo.admin.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class DeleoAjaxAuthenticationEntryPoint extends LoginUrlAuthenticationEntryPoint {

    private final Logger logger = LoggerFactory.getLogger(DeleoAjaxAuthenticationEntryPoint.class);
    private final String ajaxHeader = "AJAX";

    /**
     * @param loginFormUrl URL where the login page can be found. Should either be
     *                     relative to the web-app context path (include a leading {@code /}) or an absolute
     *                     URL.
     */
    public DeleoAjaxAuthenticationEntryPoint(String loginFormUrl) {
        super(loginFormUrl);
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        if (isAjaxRequest(request)) {
            DeleoAccessDeniedHandler.responseExpired(request, response, logger);
        } else {
            super.commence(request, response, authException);
        }
    }

    private boolean isAjaxRequest(HttpServletRequest req) {
        return req.getHeader(ajaxHeader) != null && req.getHeader(ajaxHeader).equals(Boolean.TRUE.toString());
    }
}
