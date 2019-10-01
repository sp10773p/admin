package co.kr.deleo.admin.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.dialect.IDialect;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ITemplateResolver;

import java.util.Collection;

@Configuration
public class ThymeleafConfig {

    private final Collection<ITemplateResolver> templateResolvers;
    private final ObjectProvider<IDialect> dialects;

    @Autowired
    public ThymeleafConfig(Collection<ITemplateResolver> templateResolvers,
                           ObjectProvider<IDialect> dialectsProvider) {
        this.templateResolvers = templateResolvers;
        this.dialects = dialectsProvider;
    }

    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        this.templateResolvers.forEach(templateResolver -> engine.addTemplateResolver(templateResolver));
        engine.addDialect(this.dialects.getObject());
        return engine;
    }
}