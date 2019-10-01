package co.kr.deleo.admin.config;

import co.kr.deleo.admin.base.Constant;
import co.kr.deleo.admin.security.*;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.IGoogleAuthenticator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private DeleoAuthenticationFailureHandler authenticationFailureHandler;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(authenticationProvider());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.headers().frameOptions().disable();
        http.authorizeRequests()
                .requestMatchers(new RequestMatcher() {
                    @Override
                    public boolean matches(HttpServletRequest request) {
                        return CorsUtils.isPreFlightRequest(request);
                    }
                }).permitAll()
                .antMatchers("/error/**", "/").permitAll()
                .antMatchers("/login").permitAll()
                .antMatchers("/loginForm**").permitAll()
                .antMatchers("/common/getMessage").permitAll()
                .antMatchers("/**").hasAnyRole(Constant.ADMIN.name()
                                                            , Constant.DELEO.name()
                                                            , Constant.CHIEF.name()
                                                            , Constant.SADMIN.name())

//            .and().exceptionHandling().accessDeniedHandler(new DeleoAccessDeniedHandler())
            .and().exceptionHandling().authenticationEntryPoint(authenticationEntryPoint())
            .and().formLogin()
                .authenticationDetailsSource(new DeleoWebAuthenticationDetailsSource())
                .loginPage("/loginForm")
                .defaultSuccessUrl("/loginSuccess", true)
                .loginProcessingUrl("/login")
                .failureUrl("/loginForm?error")
                .failureHandler(authenticationFailureHandler)
                .usernameParameter("userId")
                .passwordParameter("userPw")
                .permitAll()

            .and().logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/loginForm")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            .and().anonymous()
            .and().csrf()
                .ignoringAntMatchers("/common/getMessage", "/changeLang", "/error/**")
        ;
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private AuthenticationEntryPoint authenticationEntryPoint() {
        return new DeleoAjaxAuthenticationEntryPoint("/loginForm");
    }

    @Override
    public void configure(final WebSecurity web) throws Exception {
        web.ignoring()
                .antMatchers("/resources/**")
                .antMatchers("/static/**")
                .antMatchers("/actuator/**")
                .antMatchers("/css/**")
                .antMatchers("/js/**")
                .antMatchers("/font/**")
                .antMatchers("/images/**")
        ;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DeleoAuthenticationProvider authenticationProvider = new DeleoAuthenticationProvider();
        authenticationProvider.setHideUserNotFoundExceptions(false);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setAuthenticator(googleAuthenticator());

        return authenticationProvider;
    }

    @Bean
    IGoogleAuthenticator googleAuthenticator() {
        return new GoogleAuthenticator();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Bean
    @Override
    protected UserDetailsService userDetailsService() {
        return new DeleoUserDetailService();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

}

