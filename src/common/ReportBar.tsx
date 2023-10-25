import { Button } from "primereact/button";
import React from "react";
import { excelExport } from "../services/functions/excelExport";
import { IExcelReportParams } from "../interfaces/IExcelReportParams";
import { PiFileXlsFill } from "react-icons/pi";

export function ReportBar(props: IExcelReportParams) {

    const handleExportExcel = () => {
        excelExport(props).then(() => {
            console.log('Generated report');
            if (props.onButtonClick) {
                props.onButtonClick(); // Llama al evento onClick opcional si se proporciona.
            }
        }).catch(err => {
            console.error(err);
        });
    }
    return (
        <div className="divEnd">
            <button className="btnExcel" onClick={handleExportExcel}>
                <div className="svg-wrapper-1">
                    <div className="svg-wrapper">
                        <PiFileXlsFill className="icono"></PiFileXlsFill>
                    </div>
                </div>
                <span>Generar Excel</span>
            </button>
        </div>


    )
}