export interface IHeaderItem {
    header: string;
    width?: number;
}

export interface IExcelReportParams {
    reportName: string;
    headerItems: IHeaderItem[];
    rowData: any[];
    logo: string;
    onButtonClick?: () => void;
}