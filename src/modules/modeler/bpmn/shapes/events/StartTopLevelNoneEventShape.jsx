import { useState } from "react"
import { generateKey, isPointInLine } from "../../../js/canvasScripts"
import { C_ASYNCHRONOUS_MESSAGE, C_EXECUTION_SPECIFICATION, C_LIFE_LINE } from "../../../constants/ShapeTypes";
import start_top_level_none from '../../images/start_top_level_none.png'

export class StartTopLevelNoneEventShape{

    constructor(){
        this.state = {
            shape: {id:generateKey('Lifeline_'), x:770, y:60, height:80, width:250, type:C_LIFE_LINE, label:'', name:'', color:'#cfe2ff',mousestyle:'move',
                edges:[
                    {id:generateKey('edges_left_top_'), x:770-5, y:60-5, height:10, width:10, type:'edges', position:'left_top',mousestyle:'pointer'},
                    {id:generateKey('edges_right_top_'),x:770 + 250-5, y:60-5, height:10, width:10, type:'edges', position:'right_top',mousestyle:'pointer'},
                    {id:generateKey('edges_left_bottom_'),x:770-5, y:60 + 80 -5, height:10, width:10, type:'edges', position:'left_bottom',mousestyle:'pointer'},
                    {id:generateKey('edges_right_bottom_'),x:770 + 250-5, y:60 + 80 -5, height:10, width:10, type:'edges', position:'right_bottom',mousestyle:'pointer'},
                ],
                acceptedIncomingType:[C_ASYNCHRONOUS_MESSAGE],
                acceptedOutgoingType:[C_ASYNCHRONOUS_MESSAGE],
                incoming:[],
                outgoing:[],
                properties:{id:generateKey('properties_'), label:C_LIFE_LINE, type:C_LIFE_LINE, menuPath:'', fileName:'', role:''},
                verticalLine:{id:generateKey('verticalLine_'),x1:770+125, y1:60, x2:770+125, y2:500, type:'vertical_line',mousestyle:'move'},
                executionSpecifications:[]
            },
        };
    } 

    getShape(){
        return this.state.shape;
    }

    updateShpe(shape){
        this.state = {
            shape: {...shape},
          };
    }

    process(eventName){
    }

    getSelectedByMouseCoordinates(ctx, mx, my){

        let auxSelectedShapeData = {id:'', type:'',  subtypeId:'', subtype:'', mousestyle:'move', acceptedIncomingType: this.state.shape.acceptedIncomingType, acceptedOutgoingType:this.state.shape.acceptedOutgoingType}
        
        
        let auxEShape={id:''}
        this.state.shape.executionSpecifications.map((ed,j)=>{
            auxEShape = ed.getSelectedByMouseCoordinates(ctx, mx, my)
            if(auxEShape.id != ''){
                auxSelectedShapeData = auxEShape;
            }
        })
      
        if(auxSelectedShapeData.id == ''){
            if(mx>=this.state.shape.x && mx<=this.state.shape.x+this.state.shape.width && my>=this.state.shape.y && my<=this.state.shape.y+this.state.shape.height){
                auxSelectedShapeData.id    = this.state.shape.id;
                
                //auxSelectedShapeData.index = i;  
                auxSelectedShapeData.type  = this.state.shape.type;
                auxSelectedShapeData.mx    = mx - this.state.shape.x;
                auxSelectedShapeData.my    = my - this.state.shape.y;
                auxSelectedShapeData.subtype  = '';
                auxSelectedShapeData.position = '';
                auxSelectedShapeData.mousestyle = this.state.shape.mousestyle;
            }else if(isPointInLine(ctx, mx, my, this.state.shape.verticalLine.x1, this.state.shape.verticalLine.y1, this.state.shape.verticalLine.x2, this.state.shape.verticalLine.y2)){
                auxSelectedShapeData.id    = this.state.shape.id;
                auxSelectedShapeData.subtypeId    = this.state.shape.verticalLine.id;
                //auxSelectedShapeData.index = i;  
                auxSelectedShapeData.type     = this.state.shape.type;
                auxSelectedShapeData.subtype  = this.state.shape.verticalLine.type;
                auxSelectedShapeData.position = '';
                auxSelectedShapeData.mx    = mx - this.state.shape.x;
                auxSelectedShapeData.my    = my - this.state.shape.y;
                auxSelectedShapeData.position   = '';
                auxSelectedShapeData.mousestyle = this.state.shape.mousestyle;
            }else{
                this.state.shape.edges.map((ed,j)=>{
                    if(mx >= ed.x && mx <= ed.x + ed.width && my >= ed.y && my <= ed.y + ed.height){
                        auxSelectedShapeData.id        = this.state.shape.id;
                        auxSelectedShapeData.subtypeId =  ed.id;
                        auxSelectedShapeData.type      = this.state.shape.type;   
                        auxSelectedShapeData.subtype   = ed.subtype;
                        auxSelectedShapeData.position  = ed.position;
                        auxSelectedShapeData.mx = mx - this.state.shape.x;
                        auxSelectedShapeData.my = my - this.state.shape.y;
                        auxSelectedShapeData.mousestyle = this.state.shape.mousestyle;
                    }
                })
            }
        }

        return auxSelectedShapeData;
    }

    draw(ctx, selectedShapeData, shapeList, flowLinesList){ 
/*          ctx.beginPath();
         ctx.strokeStyle  = 'black';
         //creating line from points 

         let x1 = 10; 
         let y1= 20;
         let x2 = 150;
         let y2 = 73;

         ctx.moveTo(x1, y1);  
         ctx.lineTo(x2, y2);  
         
         ctx.lineWidth = 2; 
         ctx.stroke();  */

         let x1 = 10; 
         let y1= 20;
         let x2 = 150;
         let y2 = 73;

        this.GetPoints(ctx, {id:generateKey('points_'), X:x1,Y:y1}, {id:generateKey('points_'), X:x2,Y:y2})

/*         let m = (y2-y1) / (x2-x1);
        let b = y1 - (m *x1)
         console.log('pendiente, m', m)
         console.log('b para puntos x1, y1', b)
         console.log('formula-> y= ' + m + 'x' + "+" + b);

         //hacer un punto que quede dentro de la linea, sumando x
        for (var i = x1; i <x2; i++){
            let newY = (m+i +b)
            console.log('valor de y='+ newY)

            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(i, newY,10, 10)  
            ctx.stroke();
        } */

/* 
        const img = new Image();
        img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0);
        });
        img.src = start_top_level_none */
    }

    moveSelected(selectedShapeData, shapes, flowLines, mx, my){
        let found = false;
        if(selectedShapeData.type == C_EXECUTION_SPECIFICATION){
            for (var i = 0; i < this.state.shape.executionSpecifications.length; i++){ 
                if( this.state.shape.executionSpecifications[i].getShape().id == selectedShapeData.id){
                    found =  this.state.shape.executionSpecifications[i].moveSelected(selectedShapeData, shapes, flowLines, mx, my)
                }
            }
        }else if(selectedShapeData.id == this.state.shape.id){
           
            if(selectedShapeData.subtype == ''){ 

                this.state.shape.x = mx - selectedShapeData.mx
                this.state.shape.y = 60 ; // my - selectedShapeData.my

                this.state.shape.verticalLine.x1 = this.state.shape.x + this.state.shape.width/2;
                //this.state.shape.verticalLine.y1 = 60
                this.state.shape.verticalLine.x2 = this.state.shape.verticalLine.x1
                //  this.state.shape.verticalLine.y2 = 400

                this.moveEdges()

            }else if(selectedShapeData.subtype == 'edges'){

                this.state.shape.edges = this.state.shape.edges.filter(re=>{

                    if(re.orientation == 'left_top'){
                        if((this.state.shape.width + this.state.shape.x - mx) >= 50){
                            this.state.shape.width =  this.state.shape.width + this.state.shape.x - mx;
                            this.state.shape.x = mx;
                        }
                    }else if(re.orientation == 'right_top'){
                        if((mx - this.state.shape.x) >= 50){
                            this.state.shape.width = mx - this.state.shape.x;
                        }
                    }else if(re.orientation == 'left_bottom'){
                        if((this.state.shape.width + this.state.shape.x - mx) >= 50){
                            this.state.shape.width =  this.state.shape.width + this.state.shape.x - mx;
                            this.state.shape.x     = mx; 
                        }
                    }else if(re.orientation == 'right_bottom'){ 
                        if((mx - this.state.shape.x) >= 50){
                            this.state.shape.width = mx - this.state.shape.x;
                        }
                    }
                    return re;
                })

            }
            this.state.shape.outgoing.map(lineId=>{
                //validate started point
                for (var i = 0; i < flowLines.length; i++){ 
                    if(flowLines[i].getShape().id == lineId){
                        flowLines[i].moveRequest(this)
                    }
                } 
                
            })
            this.state.shape.incoming.map(lineId=>{
                //validate end point
                for (var i = 0; i < flowLines.length; i++){ 
                    if(flowLines[i].getShape().id == lineId){
                        flowLines[i].moveRequest(this)
                    }
                } 
            })
            found = true;
        }
        return found
        
    }

    //peticion de mov por un elemento externo
    moveRequest(element){
    }

    movingStopped(ctx, selectedShapeData, shapes, flowLines, mx, my){
    }


    //************************CUSTOM FUNCTIONS ****************/


    moveEdges(){
        this.state.shape.edges.filter(re=>{
            if(re.position == 'left_top'){
                re.x = this.state.shape.x-5
                re.y = this.state.shape.y-5
                re.height = 10
                re.width  = 10  
            }else if(re.position == 'right_top'){
                re.x = this.state.shape.x + this.state.shape.width -5
                re.y = this.state.shape.y-5
                re.height = 10
                re.width  = 10  
            }else if(re.position == 'left_bottom'){
                re.x = this.state.shape.x -5
                re.y = this.state.shape.y + this.state.shape.height -5
                re.height = 10
                re.width  = 10  
            }else if(re.position == 'right_bottom'){
                re.x = this.state.shape.x + this.state.shape.width -5
                re.y = this.state.shape.y + this.state.shape.height -5
                re.height = 10
                re.width  = 10  
            }
            return re;
        })
    }


     GetPoints(ctx, p1, p2)
    {
        let points = [];
    
        // no slope (vertical line)
        if (p1.X == p2.X)
        {
            for (y = p1.Y; y <= p2.Y; y++)
            {
                let p = {id:generateKey('points_'), X:p1.X, Y: y};
                points.push(p);
            }
        }
        else
        {
            // swap p1 and p2 if p2.X < p1.X
            if (p2.X < p1.X)
            {
                let temp = p1;
                p1 = p2;
                p2 = temp;
            }
    
            let deltaX = p2.X - p1.X;
            let deltaY = p2.Y - p1.Y;
            let error = -1.0;
            let deltaErr = Math.abs(deltaY / deltaX);
    
            let y = p1.Y;
            for (let x = p1.X; x <= p2.X; x++)
            {
                let p = {id:generateKey('points_'), X:x, Y: y};
                points.push(p);
                console.log("Added Point: " + p.X + "," + p.Y);
    
                error += deltaErr;
                console.log("Error is now: " + error);
    
                while (error >= 0.0)
                {
                    console.log("   Moving Y to " + y);
                    y++;
                    points.push({id:generateKey('points_'), X:x, Y:y});
                    error -= 1.0;
                }
            }
    
  /*           if (points.Last() != p2)
            {
                let index = points.IndexOf(p2);
                points.RemoveRange(index + 1, points.Count - index - 1);
            } */
        }

        points.map(p=>{

            setTimeout(()=>{
                ctx.reset();  
    
                ctx.beginPath();
                ctx.strokeStyle  = 'black';
                //creating line from points 
       
                let x1 = 10; 
                let y1= 20;
                let x2 = 150;
                let y2 = 73;
       
                ctx.moveTo(x1, y1);  
                ctx.lineTo(x2, y2);  
                
                ctx.lineWidth = 2; 
                ctx.stroke();              
    
                ctx.beginPath();
                ctx.fillStyle = "blue";
                ctx.fillRect(p.X, p.Y,12, 12)  
                ctx.stroke();

            }, 2000)
        })
        return points;
    }
 
}