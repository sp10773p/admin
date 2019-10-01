package co.kr.deleo.admin.config;

import com.navercorp.lucy.security.xss.servletfilter.XssEscapeServletFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.GsonHttpMessageConverter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableWebMvc
@EnableCaching
public class WebMvcConfig implements WebMvcConfigurer {
    private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
            "classpath:/META-INF/resources/", "classpath:/resources/",
            "classpath:/static/"};

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/loginForm").setViewName("login/login");
        registry.addViewController("/").setViewName("index.html");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(csrfTokenAddingInterceptor()).addPathPatterns("/**");
//        registry.addInterceptor(modelAndViewInterceptor())
//                .excludePathPatterns("/font/**", "/css/**", "/js/**", "/images/**", "/favicon.ico");
//        registry.addInterceptor(localeChangeInterceptor());
    }

    /**
     * lucy-xss-filter
     * @return
     */
    @Bean
    public FilterRegistrationBean getFilterRegistrationBean(){
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(new XssEscapeServletFilter());
        registrationBean.setOrder(1);
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }

    @Bean
    public HandlerInterceptor csrfTokenAddingInterceptor() {
        return new HandlerInterceptorAdapter() {
            @Override
            public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView view) {
                CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
                if (token != null && null != view) {
                    view.addObject(token.getParameterName(), token);
                }
            }
        };
    }

    @Bean
    public GsonHttpMessageConverter gsonHttpMessageConverter() {
        return new GsonHttpMessageConverter();
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(gsonHttpMessageConverter());
    }
}
