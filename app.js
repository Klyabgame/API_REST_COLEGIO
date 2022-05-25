var express= require('express');
var mysql=require('mysql');
var cors=require('cors');

var app= express();
app.use(express.json());
app.use(cors());



//establecemos los parametross
var conexion= mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'colegio'
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
    let sql2=`SELECT APELLIDOS,NOMBRES FROM tb_iniciar_session INNER JOIN tb_registro 
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




const puerto = process.env.PUERTO || 3000 ;

app.listen(puerto, function(){
    console.log("servidor ok en puerto:"+puerto);
});