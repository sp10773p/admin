package co.kr.deleo.admin.security;

import co.kr.deleo.admin.base.dto.UserInfo;
import co.kr.deleo.admin.base.exception.RequestOtpCheckException;
import co.kr.deleo.admin.base.util.DocUtil;
import com.warrenstrange.googleauth.IGoogleAuthenticator;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
public class DeleoAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

	@Setter
    private PasswordEncoder passwordEncoder;
    @Setter
    private UserDetailsService userDetailsService;
    @Setter
    private IGoogleAuthenticator authenticator;

	@Override
	protected void additionalAuthenticationChecks(UserDetails userDetails,
                                                  UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		log.info("additionalAuthenticationChecks: username={}", userDetails.getUsername());
		if (authentication.getCredentials() == null) {
            log.error("Authentication failed: no credentials provided.");
            throw new UsernameNotFoundException("No Credentials");
        }

        String credentialsPassword = authentication.getCredentials().toString();
        if (!passwordEncoder.matches(credentialsPassword, userDetails.getPassword())) {
            log.error("Authentication failed: password does not match stored value.");
            throw new UsernameNotFoundException("BadCredentials");
        }
	}

	@Override
	protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        DeleoUserDetails deleoUserDetails;

        try {
            deleoUserDetails = (DeleoUserDetails) userDetailsService.loadUserByUsername(username);
            
            if (deleoUserDetails == null) {
                throw new InternalAuthenticationServiceException("UserDetails returned null.");
            }

            UserInfo userInfo = deleoUserDetails.getUserInfo();

            DeleoWebAuthenticationDetails webAuthenticationDetails = (DeleoWebAuthenticationDetails) authentication.getDetails();

            // OTP 체크
            if ("Y".equals(userInfo.getOtpYn())) {
                if (webAuthenticationDetails.isOTP_CHECK()) {
                    String otpNo = userInfo.getOtpNo();
                    if (!StringUtils.hasText(otpNo)) {
                        throw new RequestOtpCheckException("OTP 번호가 등록 되어있지 않습니다. \n 관리자에게 문의하세요."); // OTP 번호가 등록 되어있지 않습니다. \n 관리자에게 문의하세요.
                    }

                    Integer verificationCode = webAuthenticationDetails.getOtpKey();
                    if (verificationCode != null) {

                        if (!authenticator.authorize(DocUtil.decrypt(otpNo), verificationCode)) {
                            throw new RequestOtpCheckException("OTP 번호를 확인하세요."); // OTP 번호를 확인하세요.
                        }

                    } else {
                        throw new RequestOtpCheckException("OTP 번호를 확인하세요."); // OTP 번호를 입력하세요.
                    }
                } else {
                    throw new RequestOtpCheckException();
                }
            }
        } catch (UsernameNotFoundException notFoundException) {

            if (hideUserNotFoundExceptions) {
                throw new BadCredentialsException("Bad Credentials.");
            }

            throw notFoundException;
        } catch (RequestOtpCheckException e) {

            throw e;
        } catch (Exception authenticationProblem) {
            throw new InternalAuthenticationServiceException(authenticationProblem.getMessage(), authenticationProblem);
        }

        return deleoUserDetails;
	}

    private boolean checkIpMatching(String address, List<String> ipList) {
        try {
            boolean result = true;
            if (ipList.size() == 0) {
                return true;
            }

            for (String pattern : ipList) {
                if (pattern.equals("*.*.*.*") || pattern.equals("*"))
                    return true;

                result = true;
                String[] mask = pattern.split("\\.");
                String[] ip_address = address.split("\\.");
                for (int i = 0; i < mask.length; i++) {
                    if (mask[i].equals("*") || mask[i].equals(ip_address[i])) {
                    }
                    else if (mask[i].contains("-")) {
                        byte min = Byte.parseByte(mask[i].split("-")[0]);
                        byte max = Byte.parseByte(mask[i].split("-")[1]);
                        byte ip = Byte.parseByte(ip_address[i]);
                        if (ip < min || ip > max)
                            result = false;
                    } else
                        result = false;
                }

                if (result) return true;
            }

            return result;
        }catch(ArrayIndexOutOfBoundsException e){
            return address.equals("0:0:0:0:0:0:0:1");
        }
    }

}
