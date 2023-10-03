import React from 'react';
import { format, differenceInYears, parse } from 'date-fns';
import { ICalcularEdad } from '../interfaces/ICalcularEdad';


function CalcularEdad(fechaNacimiento: string) {
    // Convierte la cadena de fecha en un objeto de fecha
    const fechaNacimientoDate = parse(fechaNacimiento, 'dd/MM/yyyy', new Date());

    // Calcula la diferencia en años entre la fecha actual y la fecha de nacimiento
    const edad = differenceInYears(new Date(), fechaNacimientoDate);

    return (
        <div>
            <p>Fecha de nacimiento: {format(fechaNacimientoDate, 'dd/MM/yyyy')}</p>
            <p>Edad: {edad} años</p>
        </div>
    );
}

export default CalcularEdad;