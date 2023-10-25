import React, { useState } from "react";
import axios, { AxiosInstance } from "axios";
import { IFichaPersonal } from "../interfaces/IFichaPersonal";

const API_BASE_URL = "http://localhost:8080/fichaPersonal/";

export class ReporteService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });
  }

  busquedaReporteRE(ci: string, gen: string, rang: number, est: boolean) {
    //Método para listar todas los Usuarios
    ci = ci || "NA";
    gen = gen || "NA";
    return this.api
      .get(`busquedaReporteRE/${ci}/${gen}/${rang}/${est}`)
      .then((res) => res.data);
  }

  busquedaReporte(ci: string, gen: string, est: boolean) {
    //Método para listar todas los Usuarios
    ci = ci || "NA";
    gen = gen || "NA";
    return this.api.get(`busquedaReporte/${ci}/${gen}/${est}`).then((res) => res.data);
  }

}
