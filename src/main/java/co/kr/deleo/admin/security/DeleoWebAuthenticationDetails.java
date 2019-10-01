package co.kr.deleo.admin.security;

import lombok.Getter;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;

/**
 * 로그인폼에 있는 "google-otp-code" 정보를 읽어온다.
 */
@Getter
public class DeleoWebAuthenticationDetails extends WebAuthenticationDetails {
	public static final String GOOGLE_OTP_CODE = "google-otp-code";
	public static final String GOOGLE_OTP_CHECK = "google-otp-check";
	private boolean OTP_CHECK;
	private Integer otpKey;
	private String userPw;
	private String clientIp;

	/**
     * Records the remote address and will also set the session Id if a session
     * already exists (it won't create one).
     *
     * @param request that the authentication request was received from
     */
	public DeleoWebAuthenticationDetails(HttpServletRequest request) {
		super(request);

        String otpCheckString = request.getParameter(GOOGLE_OTP_CHECK);
        OTP_CHECK = "Y".equals(otpCheckString);

        userPw = request.getParameter("userPw");
        clientIp = getClientIp(request);

        String totpKeyString = request.getParameter(GOOGLE_OTP_CODE);
        if (StringUtils.hasText(totpKeyString)) {
            try {
                this.otpKey = Integer.valueOf(totpKeyString);
            } catch (NumberFormatException e) {
                this.otpKey = null;
            }
        }
	}


    public String getClientIp(HttpServletRequest request) {
        String cltAddr = request.getHeader("X-Forwarded-For");
        if (cltAddr == null || cltAddr.equals("")) {
            cltAddr = request.getHeader("Proxy-Client-IP");

            if (cltAddr == null || cltAddr.equals("")) {
                cltAddr = request.getHeader("x-forwarded-ip");
            }
            if (cltAddr == null || cltAddr.equals("")) {
                cltAddr = request.getHeader("REMOTE_ADDR");
            }
            if (cltAddr == null || cltAddr.equals("")) {
                cltAddr = request.getRemoteAddr();
            }
            if (cltAddr == null || cltAddr.equals("")) {
                cltAddr = "";
            }
        }

        return cltAddr;
    }

}
