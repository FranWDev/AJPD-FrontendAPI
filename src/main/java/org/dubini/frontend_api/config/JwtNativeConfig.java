package org.dubini.frontend_api.config;

import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

@Configuration
@ImportRuntimeHints(JwtNativeConfig.JwtHintsRegistrar.class)
public class JwtNativeConfig {

    static class JwtHintsRegistrar implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            registerJjwtClasses(hints);
        }

        private void registerJjwtClasses(RuntimeHints hints) {
            try {
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.StandardKeyOperations");
                
                // Core JJWT classes
                registerJjwtClass(hints, "io.jsonwebtoken.impl.security.KeysBridge");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJwtBuilder");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJwtParser");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJwtParserBuilder");

                // Security classes
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.DefaultKeyPairBuilder");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.DefaultSecretKeyBuilder");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.StandardSecureDigestAlgorithms");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.StandardHashAlgorithms");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.StandardKeyAlgorithms");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.StandardEncryptionAlgorithms");
                
                // Key Operation Converter and related
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.KeyOperationConverter");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.AbstractJwk");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.DefaultJwkContext");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.DefaultMacAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.DefaultAeadAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.EdSignatureAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.RsaSignatureAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.EcSignatureAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.HmacAesAeadAlgorithm");
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.impl.security.GcmAesAeadAlgorithm");

                // JWT Headers and Claims
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultClaims");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultHeader");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJwsHeader");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJweHeader");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultProtectedHeader");
                
                // JWE Header Builder
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJweHeaderMutator");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJweHeaderBuilder");
                registerJjwtClass(hints, "io.jsonwebtoken.impl.DefaultJwtBuilder$DefaultBuilderHeader");

                // Security Jwks
                registerJjwtSecurityClass(hints, "io.jsonwebtoken.security.Jwks$OP");
                
            } catch (Exception e) {
                throw new RuntimeException("Failed to register JJWT classes for native image", e);
            }
        }

        private void registerJjwtSecurityClass(RuntimeHints hints, String className) {
            try {
                Class<?> clazz = Class.forName(className);
                hints.reflection().registerType(
                    clazz,
                    MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                    MemberCategory.INVOKE_DECLARED_METHODS,
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS,
                    MemberCategory.DECLARED_FIELDS,
                    MemberCategory.PUBLIC_FIELDS
                );
            } catch (ClassNotFoundException e) {
                System.err.println("JJWT Security class not found (optional): " + className);
            }
        }

        private void registerJjwtClass(RuntimeHints hints, String className) {
            try {
                Class<?> clazz = Class.forName(className);
                hints.reflection().registerType(
                    clazz,
                    MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                    MemberCategory.INVOKE_DECLARED_METHODS,
                    MemberCategory.DECLARED_FIELDS
                );
            } catch (ClassNotFoundException e) {
                System.err.println("JJWT class not found (optional): " + className);
            }
        }
    }
}