package co.kr.deleo.admin.security;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import javax.servlet.http.HttpServletRequest;

public class DeleoWebAuthenticationDetailsSource extends WebAuthenticationDetailsSource {
	@Override
    public DeleoWebAuthenticationDetails buildDetails(HttpServletRequest request) {
        return new DeleoWebAuthenticationDetails(request);
    }
}
