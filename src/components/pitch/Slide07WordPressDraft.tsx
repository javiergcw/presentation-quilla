import { motion } from 'framer-motion'
import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'
import wpListImg from '../../assets/wordpress-entradas.png'
import wpEditorImg from '../../assets/wordpress-editor.png'

const easeOut = [0.22, 1, 0.36, 1] as const

const bullets = [
  'Tracto se conecta a WordPress por API y crea un borrador automáticamente.',
  'Marketing ve la entrada en «Entradas» — estado Borrador, lista para revisar.',
  'Abren el editor, ajustan texto, publican o descartan: control humano total.',
] as const

export function Slide07WordPressDraft() {
  return (
    <TractoPitchLayout slide={7} total={PITCH_TOTAL} className="pitchSlide--wordpress">
      <div className="pitchWordpress">
        <motion.div
          className="pitchWordpress__copy"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <p className="pitchEyebrow">WordPress · Resultado real</p>
          <h2 className="pitchTitle pitchTitle--long">
            El borrador ya está en la web del banco
          </h2>
          <p className="pitchWordpress__lead">
            Después de conectar con WordPress, el equipo encargado de subir contenido encuentra
            la propuesta aprobada como <strong>borrador</strong> — sin copiar y pegar desde cero.
          </p>
          <ul className="pitchWordpress__bullets">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>

        <div className="pitchWordpress__screens">
          <motion.figure
            className="pitchWordpress__shot pitchWordpress__shot--list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: easeOut }}
          >
            <figcaption className="pitchWordpress__caption">
              Lista de entradas · Borrador visible para coordinación
            </figcaption>
            <img
              src={wpListImg}
              alt="WordPress Serfinanza: entrada en borrador sobre CDT y tarjeta de crédito"
              className="pitchWordpress__img"
            />
          </motion.figure>

          <motion.figure
            className="pitchWordpress__shot pitchWordpress__shot--editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: easeOut }}
          >
            <figcaption className="pitchWordpress__caption">
              Editor Gutenberg · FAQs listas para publicar o editar
            </figcaption>
            <img
              src={wpEditorImg}
              alt="Editor WordPress con preguntas frecuentes CDT y tarjeta de crédito Serfinanza"
              className="pitchWordpress__img"
            />
          </motion.figure>
        </div>
      </div>
    </TractoPitchLayout>
  )
}
