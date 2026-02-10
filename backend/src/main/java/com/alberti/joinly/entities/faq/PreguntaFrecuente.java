package com.alberti.joinly.entities.faq;

import com.alberti.joinly.entities.enums.CategoriaFaq;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pregunta_frecuente", indexes = {
                @Index(name = "idx_faq_categoria", columnList = "categoria"),
                @Index(name = "idx_faq_orden", columnList = "orden")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PreguntaFrecuente {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_pregunta")
        @EqualsAndHashCode.Include
        private Long id;

        @NotBlank
        @Column(name = "pregunta", nullable = false, length = 300)
        private String pregunta;

        @NotBlank
        @Column(name = "respuesta", nullable = false, columnDefinition = "TEXT")
        private String respuesta;

        @Enumerated(EnumType.STRING)
        @Column(name = "categoria", nullable = false, length = 30)
        @NotNull
        private CategoriaFaq categoria;

        @Column(name = "orden", nullable = false)
        @Builder.Default
        private Integer orden = 0;

        @Column(name = "activo", nullable = false)
        @Builder.Default
        private Boolean activo = true;

        @Column(name = "fecha_creacion", nullable = false, updatable = false)
        private LocalDateTime fechaCreacion;

        @PrePersist
        protected void onCreate() {
                if (fechaCreacion == null) {
                        fechaCreacion = LocalDateTime.now();
                }
        }
}
