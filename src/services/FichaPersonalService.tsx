import React, { useState } from 'react';
import axios, { AxiosInstance } from "axios";
import { IFichaPersonal } from '../interfaces/IFichaPersonal';

const API_BASE_URL = 'http://localhost:8080/fichaPersonal/';

export class FichaPersonalService {

    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL
        });
    }

    getAll() {
        //Método para listar todas los Usuarios
        return this.api.get("get").then((res) => res.data);
    }

    getByPersona(est: boolean, busqueda: string) {
        busqueda = busqueda || "NA";
        return this.api
          .get(`busquedaCiNombre/${est}/${busqueda}`)
          .then((res) => res.data);
      }
    

    getBusquedaRE(ci: string, gen: string, rang: number, est: boolean) {
        //Método para listar todas los Usuarios
        ci = ci || "NA";
        gen = gen || "NA";
        console.log(`busquedaRE/${ci}/${gen}/${rang}/${est}`)
        return this.api.get(`busquedaRE/${ci}/${gen}/${rang}/${est}`).then((res) => res.data);
    }

    getBusqueda(ci: string, gen: string, est: boolean) {
        //Método para listar todas los Usuarios
        ci = ci || "NA";
        gen = gen || "NA";
        console.log(`busqueda/${ci}/${gen}/${est}`)
        return this.api.get(`busqueda/${ci}/${gen}/${est}`).then((res) => res.data);
    }

    getBusquedaRelacion(est: boolean, busq: string,) {
        //Método para listar todas los Usuarios
        busq = busq || "NA";
        console.log(`busquedaCiNombre/${est}/${busq}`)
        return this.api.get(`busquedaCiNombre/${est}/${busq}`).then((res) => res.data);
    }

    save(fichaPersonal: any) {
        console.log(fichaPersonal)
        return this.api.post("post", fichaPersonal).then((res) => res.data)
            .catch(error => {
                throw error
            })
    }

    update(id: number, fichaPersonal: IFichaPersonal) {
        return this.api.put(`put/${id}`, fichaPersonal).then((res) => res.data)
            .catch(error => {
                throw error
            })
    }

    delete(id: number) {
        return this.api.delete(`delete/${id}`).then((res) => res.data);
    }
}