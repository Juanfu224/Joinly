
import { PreguntaFrecuente } from 'app/models';

interface CatergoriaConPreguntas {
    readonly nombre: string;
    readonly preguntas: PreguntaFrecuente[];
}

@Component({
    selector: 'app-preguntas',
    standalone: true,
    imports: [PreguntaCardComponent],
    templateUrl: './preguntas.html',
})
