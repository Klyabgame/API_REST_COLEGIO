var express= require('express');
var mysql=require('mysql');
var cors=require('cors');

var app= express();
app.use(express.json());
app.use(cors());



//establecemos los parametross

var conexion= mysql.createConnection({
    host:'us-cdbr-east-05.cleardb.net',
    user:'bcc3ba0a62ffe7',
    password:'dbb13e49',
    database:'heroku_db9e0b9888a14'
});

//probar la conexion

conexion.connect(function(error){
    if(error){
        throw error;

    }else{
        console.log("conexion es exitosa");
    }
});

app.get('/', function(req,res){
    res.send('ruta INICIO');

})

app.get('/api/colegio', (req,res)=>{
    conexion.query('SELECT * FROM tb_registro', (error,filas)=>{
        if(error){
            throw error;

        }else{
            res.send(filas);
        }
    })
});

//mostrar solo un articulo
app.get('/api/colegio/:id', (req,res)=>{
    conexion.query('SELECT * FROM tb_registro WHERE ID_REGISTRO=?',[req.params.id], (error,fila)=>{
        if(error){
            throw error;

        }else{
            res.send(fila);
            /* res.send(fila[0].Nombres); */
        }
    })
});
app.post('/api/colegio',(req,res)=>{
    let data= {DNI:req.body.DNI,NOMBRES:req.body.NOMBRES, APELLIDOS:req.body.APELLIDOS,
        DIRECCION:req.body.DIRECCION, TELEFONO:req.body.TELEFONO,FOTO:req.body.FOTO,EDAD:req.body.EDAD,CORREO:req.body.CORREO,ID_ROL:req.body.ID_ROL}

    let sql="INSERT INTO tb_registro SET ?";
    conexion.query(sql, data, function(error, results){
        if(error){
            throw error;

        }else{
            /* res.send(results); */
            Object.assign(data,{id:results.insertId});
            res.send(data);
            
        }
    });
});

//para editar
app.put('/api/colegio/:id', (req,res)=>{
    let ID_REGISTRO =req.params.ID_REGISTRO;
    let DNI=req.params.DNI;
    let NOMBRES=req.body.NOMBRES;
    let APELLIDOS=req.body.APELLIDOS;
    let DIRECCION=req.body.DIRECCION;
    let TELEFONO=req.body.TELEFONO;
    let FOTO=req.body.FOTO;
    let EDAD=req.body.EDAD;
    let CORREO=req.body.CORREO;
    let ID_ROL=req.body.ID_ROL;
    let sql="UPDATE tb_registro SET DNI=?, NOMBRES=?, APELLIDOS=?, DIRECCION=?,TELEFONO=?, FOTO=?, EDAD=?,CORREO=?,ID_ROL=? WHERE ID_REGISTRO=?";
    conexion.query(sql,[DNI,NOMBRES,APELLIDOS,DIRECCION,TELEFONO,FOTO,EDAD,CORREO,ID_ROL,ID_REGISTRO], function(error,results){
        if(error){
            throw error;

        }else{
            res.send(results);
            
        }
    });
});

//eliminar articulos
app.delete('/api/colegio/:id', (req,res)=>{
    conexion.query('DELETE FROM tb_registro WHERE ID_REGISTRO=?', [req.params.id],function(error,filas){
        if(error){
            throw error;

        }else{
            res.send(filas);
            
        }
    });
});


app.get('/api/session', (req,res)=>{
    conexion.query('SELECT * FROM tb_iniciar_session', (error,filas)=>{
        if(error){
            throw error;

        }else{
            res.send(filas);
        }
    })
});


//para session
app.post('/api/session/auth', (req, res)=> {
	let _USSER = req.body.USSER;
	let _PASSWORD = req.body.PASSWORD;
    let sql=`SELECT * FROM tb_iniciar_session WHERE USSER='${_USSER}' and PASSWORD='${_PASSWORD}'`;
    console.log(sql);
    console.log(_USSER); 
    console.log(_PASSWORD);  
    /* let passwordHash = await bcrypt.hash(PASSWORD, 8); {USSER:USSER, PASSWORD:_PASSWORD},*/ 
    if(_USSER && _PASSWORD){
        conexion.query(sql, (error, results)=> {

			if(results.length==0 || results==false){
                res.send('Incorrect Username and/or Password!');
                
            }else{
                console.log('usuario ingresado correctamtente');
                /* req.session.loggedin=true; */
                /* req.session.name=results[0].name; */
                res.send(results)
            }
		});


    }else{
        res.send('Please enter user and Password!');
		res.end();
    }

    
});

//INNER JOIN
app.get(`/api/session/auth/:usser`, (req,res)=>{
    /* let _USSER=req.body.USSER; */
    let sql2=`SELECT DNI,APELLIDOS,NOMBRES,CORREO,TELEFONO,DIRECCION,EDAD FROM tb_iniciar_session INNER JOIN tb_registro 
    ON tb_iniciar_session.ID_REGISTRO=tb_registro.ID_REGISTRO WHERE USSER=?`;
    console.log(sql2);
    conexion.query(sql2,[req.params.usser],(error,resultado)=>{
        if(error){
            throw error;

        }else{
            res.send(resultado);
        }
    })
});


//conexion para curso
app.get('/api/curso', (req,res)=>{
    conexion.query('SELECT * FROM tb_matricula', (error,filas)=>{
        if(error){
            throw error;

        }else{
            res.send(filas);
        }
    })
});

//conexion alumno por dni para su curso
app.get('/api/curso/:DNI', (req,res)=>{
    conexion.query('SELECT *FROM tb_matricula INNER JOIN tb_alumno ON tb_matricula.ID_ALUMNO=tb_alumno.ID_ALUMNO  INNER JOIN tb_registro ON tb_alumno.ID_REGISTRO=tb_registro.ID_REGISTRO INNER JOIN tb_curso ON tb_matricula.ID_CURSO=tb_curso.ID_CURSO INNER JOIN tb_profesor ON tb_matricula.ID_PROFESOR=tb_profesor.ID_PROFESOR LEFT JOIN tb_notas ON tb_matricula.ID_MATRICULA=tb_notas.ID_NOTAS WHERE DNI=?',[req.params.DNI], (error,fila)=>{
        if(error){
            throw error;

        }else{
            res.send(fila);
            /* res.send(fila[0].Nombres); */
        }
    })
});
//notas
app.get('/api/notas', (req,res)=>{
    conexion.query('SELECT * FROM tb_notas', (error,filas)=>{
        if(error){
            throw error;

        }else{
            res.send(filas);
        }
    })
});


//editar y actualizar notas
app.put('/api/notas/:DNI/:CURSO', (req,res)=>{
    let DNI=req.params.DNI;
    let CURSO=req.params.CURSO;
    let P_BIMESTRE=req.body.P_BIMESTRE;
    let S_BIMESTRE=req.body.S_BIMESTRE;
    let T_BIMESTRE=req.body.T_BIMESTRE;
    let C_BIMESTRE=req.body.C_BIMESTRE;
    
    let sql="UPDATE tb_notas INNER JOIN tb_matricula ON tb_notas.ID_MATRICULA=tb_matricula.ID_MATRICULA INNER JOIN tb_alumno ON tb_matricula.ID_ALUMNO=tb_alumno.ID_ALUMNO INNER JOIN tb_registro ON tb_alumno.ID_REGISTRO=tb_registro.ID_REGISTRO INNER JOIN tb_curso on tb_matricula.ID_CURSO=tb_curso.ID_CURSO SET P_BIMESTRE=?, S_BIMESTRE=?, T_BIMESTRE=?, C_BIMESTRE=? WHERE DNI=? AND NAME_CURSO='?'";
    conexion.query(sql,[P_BIMESTRE,S_BIMESTRE,T_BIMESTRE,C_BIMESTRE, DNI, CURSO], function(error,results){
        if(error){
            throw error;

        }else{
            res.send(results);
            
        }
    });
});



const puerto = process.env.puerto || 3000 ;

app.listen(puerto, function(){
    console.log("servidor ok en puerto:"+puerto);
});
