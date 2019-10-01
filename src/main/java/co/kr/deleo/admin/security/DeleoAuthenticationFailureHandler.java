package co.kr.deleo.admin.security;

import co.kr.deleo.admin.base.exception.LoginLockException;
import co.kr.deleo.admin.base.exception.RequestOtpCheckException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class DeleoAuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final Logger logger = LoggerFactory.getLogger(DeleoAuthenticationFailureHandler.class);

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        String userId = request.getParameter("userId");
        if (StringUtils.isNotEmpty(userId)) {
//            commonService.updateLoginFailCntAdd(userId);
            // add login fail count at user table
        }

        if (exception instanceof BadCredentialsException) {
            response.sendRedirect(String.format("/loginForm?error=%s", URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8.displayName())));

        } else if (exception instanceof InternalAuthenticationServiceException) {
            response.sendRedirect(String.format("/loginForm?error=%s", URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8.displayName())));

        } else if (exception instanceof LoginLockException) {
            response.sendRedirect(String.format("/loginForm?error=%s", URLEncoder.encode("로그인 정보를 확인하세요.", StandardCharsets.UTF_8.displayName())));

        } else if (exception instanceof UsernameNotFoundException) {
            response.sendRedirect(String.format("/loginForm?error=%s", URLEncoder.encode("로그인 정보를 확인하세요.", StandardCharsets.UTF_8.displayName()))); // todo 메시지 변경

        }else if (exception instanceof RequestOtpCheckException) {
            String msg = exception.getMessage();

            String uri = String.format("/loginForm?otpCheck=Y&userId=%s&userPw=%s", userId, request.getParameter("userPw"));
            if (StringUtils.isNotEmpty(msg)) {
                uri = String.format("%s&otpCheckMsg=%s", uri, URLEncoder.encode(msg, StandardCharsets.UTF_8.displayName()));
            }
            response.sendRedirect(uri);
        }
    }

}
