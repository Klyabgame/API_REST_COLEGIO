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
app.post('/api/session/auth', async (req, res)=> {
	const USSER = req.body.USSER;
	const PASSWORD = req.body.PASSWORD;    
    let passwordHash = await bcrypt.hash(PASSWORD, 8);
	if (USSER && PASSWORD) {
		connection.query('SELECT * FROM tb_iniciar_session WHERE USSER = ?', [USSER], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcrypt.compare(PASSWORD, results[0].PASSWORD)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

const puerto = process.env.PUERTO || 3000 ;

app.listen(puerto, function(){
    console.log("servidor ok en puerto:"+puerto);
});