export interface ApiResponse{
  data:any[],
   id_usuario: number;
   username: string;
   password: string;
   persona: {
    idPersona: number;
   };
   rol: {
     idRol: number;
   };
}