import { Button } from "primereact/button";
import React from "react";
import { excelExport } from "../services/functions/excelExport";
import { IExcelReportParams } from "../interfaces/IExcelReportParams";
import { PiFilePdfFill, PiFileXlsFill } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa6";
import previewBase64PDF from "./previewPDF";
import dowloadBase64 from "./dowloadPDF";

export interface IpdfProps {
    base64: string;
    filename: string;
    tipo: string;
}

export function ButtonPDF(props: IpdfProps) {
    return (
        <>
            {props.base64 ? (

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                        className="btnPdf"
                        onClick={() =>
                            dowloadBase64(props.base64!, props.filename, props.tipo)
                        }
                    >
                        <div className="svg-wrapper-1">
                            <div className="svg-wrapper">
                                <PiFilePdfFill className="icono"></PiFilePdfFill>
                            </div>
                        </div>
                        <span>Descargar</span>
                    </button>
                    <button
                        className="btnPdf"
                        onClick={() =>
                            previewBase64PDF(props.base64!, props.filename)
                        }
                    >
                        <div className="svg-wrapper-1">
                            <div className="svg-wrapper">
                                <FaRegEye className="iconoView"></FaRegEye>
                            </div>
                        </div>
                        {/* <span> </span> */}
                    </button>

                </div>

            ) : (
                <span>Documento pendiente</span>
            )}
        </>
    )
}