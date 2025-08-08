// src/main/java/self/config/SecurityConfig.java
package self.config;

import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private FirebaseAuth firebaseAuth; // 사용 안 해도 빈 주입 유지 (추후 인증 연동 대비)

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            // CORS 활성화 (아래 CorsConfigurationSource 빈 사용)
            .cors().and()
            // CSRF는 API 서버에서 보통 비활성화
            .csrf().disable()
            // 세션 사용 안 함
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            // 프리플라이트(OPTIONS)는 모두 허용, 그 외는 일단 전부 허용
            .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().permitAll();
    }

    /**
     * 전역 CORS 설정
     * - Origin: 프런트 배포 주소 & 로컬 개발 주소
     * - Methods/Headers: 프론트에서 쓰는 값 허용
     * - Credentials: 필요 없으면 false (Authorization 헤더만 쓰면 false 권장)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ 프런트 도메인들 추가
        config.setAllowedOrigins(List.of(
            "http://34.54.82.32",   // 현재 배포된 프런트 (http)
            "https://34.54.82.32",  // 혹시 https로 접근할 수도 있으니
            "http://localhost:3000" // 로컬 개발
        ));

        // ✅ 허용 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // ✅ 허용 헤더 (프론트에서 보내는 헤더 포함)
        config.setAllowedHeaders(List.of(
            "Content-Type",
            "Authorization",
            "x-authenticated-user-uid",
            "X-Requested-With",
            "Accept",
            "Origin"
        ));

        // 자격 증명(쿠키 등) 안 쓰면 false
        config.setAllowCredentials(false);

        // 프리플라이트 캐시 (초 단위)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 위 설정 적용
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // FirebaseFilter 등 기존 커스텀 필터는 현재 미사용이므로 생략
}
