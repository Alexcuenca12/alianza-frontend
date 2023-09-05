export interface ApiResponse{
  data:any[],
   id_usuario: number;
   username: string;
   password: string;
   fichaPersonal: {
    idFichaPersonal: number;
   };
   rol: {
     idRol: number;
   };
}