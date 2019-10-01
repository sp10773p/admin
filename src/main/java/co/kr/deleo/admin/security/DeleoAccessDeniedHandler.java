package co.kr.deleo.admin.security;

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class DeleoAccessDeniedHandler implements AccessDeniedHandler {
    private Logger logger = LoggerFactory.getLogger(DeleoAccessDeniedHandler.class);
    private final String ajaxHeader = "AJAX";
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            request.getSession().invalidate();
            logger.warn("User: {} attempted to access the protected URL: {}", auth.getName(), request.getRequestURI());
            response.sendRedirect(request.getContextPath() + "/error/403");
        } else {

            if (isAjaxRequest(request)) {
                responseExpired(request, response, logger);
            } else {
                response.sendRedirect(String.format("/loginForm?error=%s", URLEncoder.encode("세션이 만료되었습니다.", StandardCharsets.UTF_8.displayName())));
            }
        }
    }

    static void responseExpired(HttpServletRequest request, HttpServletResponse response, Logger logger) throws IOException {
        logger.info("::: User session time out from AJAX - {}", request.getRequestURI());
        Gson gson = new Gson();
        Map map = new HashMap<>();
        map.put("status", -9001);

        OutputStream outputStream = response.getOutputStream();
        outputStream.write(gson.toJson(map).getBytes());
        outputStream.flush();
    }

    private boolean isAjaxRequest(HttpServletRequest req) {
        return req.getHeader(ajaxHeader) != null && req.getHeader(ajaxHeader).equals(Boolean.TRUE.toString());
    }
}
