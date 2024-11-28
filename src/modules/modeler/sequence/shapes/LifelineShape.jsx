import { useState } from "react"
import { generateKey, isPointInLine, intersectsRect1ByRect2 } from "../../js/canvasScripts"
import { C_ASYNCHRONOUS_MESSAGE, C_EXECUTION_SPECIFICATION, C_LIFE_LINE, C_DEFAULT_BORDER_MOVE_COLOR } from "../../constants/ShapeTypes";
import { ExecutionSpecificationShape } from "./ExecutionSpecificationShape";
import { ConnectorProcessor } from "../../connector/ConnectorProcessor";
import { newSelectedShapeData } from "../../js/canvasDrawFunction";


const DEFAULT_X = 770
const DEFAULT_y = 60
const DEFAULT_height = 50
const DEFAULT_width  = 150

export class LifelineShape{

    constructor(){
       
        this.state = {
            shape: {id:generateKey('Lifeline_'), 
                x:DEFAULT_X, 
                y:DEFAULT_y, 
                height:DEFAULT_height, 
                width:DEFAULT_width,
                type:C_LIFE_LINE, 
                label:'', 
                name:'', 
                color:'#cfe2ff',
                mousestyle:'move',
                //acceptedIncomingType:[C_ASYNCHRONOUS_MESSAGE],
                //acceptedOutgoingType:[C_ASYNCHRONOUS_MESSAGE],
                acceptedOutgoingType:[],
                acceptedIncomingType:[],
                incoming:[],
                outgoing:[], 
                containerParentId:'',
                isContainer: true,
                containerAcceptedType:[],
                edges:[
                    {id:generateKey('edges_left_top_'), x:DEFAULT_X-5, y:DEFAULT_y-5, height:10, width:10, type:'edges', position:'left_top',mousestyle:'pointer'},
                    {id:generateKey('edges_right_top_'),x:DEFAULT_X + DEFAULT_width-5, y:DEFAULT_y-5, height:10, width:10, type:'edges', position:'right_top',mousestyle:'pointer'},
                    {id:generateKey('edges_left_bottom_'),x:DEFAULT_X-5, y:DEFAULT_y + DEFAULT_height -5, height:10, width:10, type:'edges', position:'left_bottom',mousestyle:'pointer'},
                    {id:generateKey('edges_right_bottom_'),x:DEFAULT_X + DEFAULT_width-5, y:DEFAULT_y + DEFAULT_height -5, height:10, width:10, type:'edges', position:'right_bottom',mousestyle:'pointer'},
                ],
                properties:{id:generateKey('properties_'), label:C_LIFE_LINE, type:C_LIFE_LINE, menuPath:'', fileName:'', role:''},
                verticalLine:{id:generateKey('verticalLine_'),x1:DEFAULT_X + DEFAULT_width /2, y1:DEFAULT_y, x2:DEFAULT_X + DEFAULT_width /2, y2:500, type:'vertical_line',mousestyle:'move', color:'#cfe2ff'},
           
           
            }, 
            content:[], // se saca del json shape para poder hacer el clone
            executionSpecifications:[],
            connectors:[],
            connectorProcessor: new ConnectorProcessor()
        };
    } 

     
    getShape(){
        return this.state.shape;
    }

    updateShpe(shape){
        this.state = {
            shape: {...shape},
            executionSpecifications: this.state.executionSpecifications
          };
    }

    cloneElement(){
        let lifelineShape = new LifelineShape();
        lifelineShape.state.shape = structuredClone(this.state.shape)
        lifelineShape.state.executionSpecifications = this.state.executionSpecifications.map(exS=> exS.cloneElement())
        return lifelineShape;
    }

    process(eventName){
    }


    //---------------------FUNCIONES DE MOVIMIENTO IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */
    /**
     * Dibujar la figura
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     */
    draw(ctx, selectedShapeData, shapeList){ 
        ctx.setLineDash([]);
        let allowContain = this.state.connectorProcessor.process(ctx,
            this.state.connectors, 
            selectedShapeData, 
            this);

        //if(selectedShapeData.id == this.state.shape.id){
        //vertical line
        ctx.beginPath();
        ctx.strokeStyle  = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
        ctx.moveTo(this.state.shape.verticalLine.x1, this.state.shape.verticalLine.y1); 
        ctx.lineTo(this.state.shape.verticalLine.x2, this.state.shape.verticalLine.y2);
        ctx.lineWidth = 2; 
        ctx.stroke();  
        // }

        ctx.beginPath();
        ctx.fillStyle   = this.state.shape.color;
        ctx.strokeStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
        ctx.roundRect(this.state.shape.x, this.state.shape.y, this.state.shape.width, this.state.shape.height, 5)
        //const a = new Path2D()
        //a.rect(this.state.shape.x, this.state.shape.y, this.state.shape.width, this.state.shape.height)  
        ctx.fill()
        ctx.stroke() 

        ctx.beginPath();
        ctx.fillStyle  = 'black';
        ctx.font = "20px Arial";  //serif
        ctx.textAlign = "left";
 
       ctx.fillText(this.state.shape.properties.label, this.state.shape.x, this.state.shape.y-5);
  
        ctx.stroke();

        if(selectedShapeData.id == this.state.shape.id){
           
            this.state.shape.edges.map(re=>{
                ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
                ctx.beginPath();
                ctx.fillRect(re.x, re.y, re.width, re.height)  
                ctx.stroke();
            })

            //vertical line, create rectangle at the begining and end of the horizontal line
            ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
            ctx.beginPath();
            ctx.fillRect(this.state.shape.verticalLine.x2-5, this.state.shape.verticalLine.y2, 10, 10)  
            ctx.stroke();

            ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
            ctx.beginPath();
            ctx.fillRect(this.state.shape.verticalLine.x1-5, this.state.shape.y + this.state.shape.height, 10, 10)  
            ctx.stroke();
            
        }

        this.state.executionSpecifications.map(exs=>{
            exs.draw(ctx, selectedShapeData, shapeList)
        })
    }


    /**
     * Indica que el mouse dejo de moverse, entonces se actualizan
     * las posiciones de las figuras
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     * @param {*} shapes 
     * @param {*} mx 
     * @param {*} my 
     */
    movingStopped(ctx, selectedShapeData, shapes, mx, my){
        if(selectedShapeData.type == C_EXECUTION_SPECIFICATION){
            let currentExEsp = this.state.executionSpecifications.find(es=> es.getShape().id == selectedShapeData.id)
            if(currentExEsp){
                const removeList = []
                this.state.executionSpecifications = this.state.executionSpecifications.filter(exEsp=>{
                    if(currentExEsp.getShape().id != exEsp.getShape().id){
                        if(intersectsRect1ByRect2(currentExEsp.getShape(), exEsp.getShape())){
                            removeList.push(exEsp)
                            if(currentExEsp.getShape().y > exEsp.getShape().y){
                                currentExEsp.getShape().height = currentExEsp.getShape().y + currentExEsp.getShape().height  -  exEsp.getShape().y
                                currentExEsp.getShape().y = exEsp.getShape().y
                            }
                            if((currentExEsp.getShape().y + currentExEsp.getShape().height) < (exEsp.getShape().y + exEsp.getShape().height)){
                                currentExEsp.getShape().height = exEsp.getShape().height +  exEsp.getShape().y - currentExEsp.getShape().y
                            }
                            currentExEsp.moveRequest(ctx, this, selectedShapeData, shapes, mx, my)
                            return false
                        } return true
                    }return true;
                })
                removeList.map(exEsp=>{

                })
            }
        }
    }

    /**
     * Se usa cuando se esta moviendo por el mouse
     * @param {*} selectedShapeData 
     * @param {*} shapes 
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    moveSelected(ctx, selectedShapeData, shapes, mx, my){
        let found = false;
        if(selectedShapeData.type == C_EXECUTION_SPECIFICATION){
            for (var i = 0; i < this.state.executionSpecifications.length; i++){ 
                if( this.state.executionSpecifications[i].getShape().id == selectedShapeData.id){
                    found =  this.state.executionSpecifications[i].moveSelected(ctx, selectedShapeData, shapes, mx, my)
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

                this.state.shape.outgoing.map(lineId=>{
                    //validate started point
                    for (var i = 0; i < shapes.length; i++){ 
                        if(shapes[i].getShape().id == lineId){
                            shapes[i].moveRequest(ctx, this, selectedShapeData, shapes, mx, my)
                        }
                    } 
                    
                })
                this.state.shape.incoming.map(lineId=>{
                    //validate end point
                    for (var i = 0; i < shapes.length; i++){ 
                        if(shapes[i].getShape().id == lineId){
                            shapes[i].moveRequest(ctx, this, selectedShapeData, shapes, mx, my)
                        }
                    } 
                })

                this.moveEdges()
                this.moveExecutionSpecifications(ctx, selectedShapeData, shapes, mx, my)

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

            found = true;
        }
        return found
        
    }

    /**
     * Se pretende cancelar el movimiento cuando se toca 
     * la tecla de cancelar
     * @param {*} ctx 
     * @param {*} clonedShape 
     * @returns 
     */
    movingCancel(ctx, clonedShape){ 
        let found = false;
        if(clonedShape.state.shape.id == this.state.shape.id){
            this.state.shape = clonedShape.state.shape;
            this.state.executionSpecifications = clonedShape.state.executionSpecifications
            found = true;
        }else{
            for (var i = 0; i < this.state.executionSpecifications.length; i++) { 
                found =  this.state.executionSpecifications[i].movingCancel(ctx, clonedShape);
                if(found){
                    break;
                }
            }
        }
        return found
    }

    /**
     * se utiliza en el canvasOnMouseDown y en 
     * el mouseOverElementCursor, para encontrar cualquier 
     * tipo de figura, sea principal o secundaria
     * @param {*} ctx 
     * @param {*} mx 
     * @param {*} my 
     * @returns 
     */
    getSelectedByMouseCoordinates(ctx, mx, my){
        //let newSelectedShapeData = {id:'', type:'',  subtypeId:'', subtype:'', mousestyle:'move', acceptedIncomingType: this.state.shape.acceptedIncomingType, acceptedOutgoingType:this.state.shape.acceptedOutgoingType}
        
        let auxSelectedShapeData = newSelectedShapeData()
        auxSelectedShapeData.mousestyle='move'
        auxSelectedShapeData.acceptedIncomingType = this.state.shape.acceptedIncomingType;
        auxSelectedShapeData.acceptedOutgoingType = this.state.shape.acceptedOutgoingType

        let auxEShape={id:''}
       
        this.state.executionSpecifications.map((ed,j)=>{
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
                auxSelectedShapeData.currentShape = this
                auxSelectedShapeData.shape = this.cloneElement()
            }else if(isPointInLine(ctx, mx, my, this.state.shape.verticalLine.x1, this.state.shape.verticalLine.y1, this.state.shape.verticalLine.x2, this.state.shape.verticalLine.y2)){
                //vertical line
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
                auxSelectedShapeData.currentShape = this
                auxSelectedShapeData.shape = this.cloneElement()
            }else{
                this.state.shape.edges.map((ed,j)=>{
                    if(mx >= ed.x && mx <= ed.x + ed.width && my >= ed.y && my <= ed.y + ed.height){
                        auxSelectedShapeData.id        = this.state.shape.id;
                        auxSelectedShapeData.subtypeId =  ed.id;
                        auxSelectedShapeData.type      = this.state.shape.type;   
                        auxSelectedShapeData.subtype   = ed.type;
                        auxSelectedShapeData.position  = ed.position;
                        auxSelectedShapeData.mx = mx - this.state.shape.x;
                        auxSelectedShapeData.my = my - this.state.shape.y;
                        auxSelectedShapeData.mousestyle = this.state.shape.mousestyle;
                        auxSelectedShapeData.currentShape = this
                        auxSelectedShapeData.shape = this.cloneElement()
                    }
                })
            }
        }

        return auxSelectedShapeData;
    }


    /**
     * Petición de movimiento por parte de un elemento externo.
     * Se usa en la creación de una linea a traves de una clase connector (ExeSpecificationAsynMessageConnector)
     * LifeLineShape utiliza en los metodos:
     * - del ExecutionSpecificationShape.moveRequest
     * - del ExecutionSpecificationShape.movingStopped
     * - del ExecutionSpecificationShape.moveExecutionSpecifications
     * para moverlo.
     *  
     * @param {*} element 
     */
    moveRequest(ctx, element, selectedShapeData, shapes, mx, my){
    }


    /**
     * Buscar si el id le pertenece o a algún hijo tipo figura principal
     * @param {*} id 
     * @returns 
     */
    findById(id){
        if(this.state.shape.id == id) return this;
         
        for (let index = 0; index < this.state.executionSpecifications.length; index++) {
            const element = this.state.executionSpecifications[index].findById(id);
            if(element != null) return element;
        }
        return null;
    }

    /**
     * Se utiliza cuando se mueve un elemneto y se quiere saber
     * si queda icluido dentro de otro
     * @param {*} mx 
     * @param {*} my 
     * @param {*} shapes 
     * @param {*} incomingType 
     * @returns 
     */
    findByCoordinatesAndAcceptanceType(ctx,mx, my, shapes, incomingType, byContainer, excluded){
        let auxEShape = null;
        for (let index = 0; index < this.state.executionSpecifications.length; index++) {
            auxEShape = this.state.executionSpecifications[index].findByCoordinatesAndAcceptanceType(ctx,mx, my, shapes, incomingType, byContainer, excluded);
            if(auxEShape != null) index = this.state.executionSpecifications.length
        }

        if(auxEShape==null)
            if((mx>=this.state.shape.x && mx<=this.state.shape.x+this.state.shape.width && my>=this.state.shape.y && my<=this.state.shape.y+this.state.shape.height) 
                &&  !byContainer &&
                this.state.shape.acceptedIncomingType.includes(incomingType))
            auxEShape = this;
       
        return auxEShape;
    }


    
    /**
     * se utiliza para eliminar cuaqluier elemento hijo
     * antes de que se elimine a el mimso
     */
    remove(data){
        //buscar las lineas outgoing e incoming y decirles que se eliminen
        //por cada executionShape mandar a eliminarse (Estos no estan directamente en el listado)
        this.state.executionSpecifications.map(exs=>{
            data = exs.remove(data)
        })
        //eliminarse de la shapes
        for (var i = 0; i < data.shapes.length; i++){ 
            if(this.state.shape.outgoing.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }else if(this.state.shape.incoming.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }
        } 
        data.shapes = data.shapes.filter(s=> s.getShape().id != this.getShape().id) 
        return {shapes:data.shapes}
    }

    //---------------------END FUNCIONES IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */


    //************************CUSTOM FUNCTIONS ****************/

    addExecutionSpecification(canvasRef){
        
        // higher y
        let higherY = this.state.shape.y + this.state.shape.height;

        this.state.executionSpecifications.map(exs=>{
            if ( (exs.getShape().y + exs.getShape().height) > higherY)
                higherY = (exs.getShape().y + exs.getShape().height)
        })

        this.state.shape.incoming.map(lineId=>{
            let lineElement = shapes.find(l=> l.getShape().id == lineId )
            if(lineElement)
                if ( lineElement.getShape().points[0].y > higherY)
                    higherY = lineElement.getShape().points[0].y
        })

        higherY = higherY+ 10
        let executionSpecificationShape = new ExecutionSpecificationShape(this.state.shape.id, this.state.shape.x - 10 + this.state.shape.width/2, higherY);
        this.state.executionSpecifications.push(executionSpecificationShape)

       let auxSelectedShapeData = {id:'', type:'', subtype:'', mousestyle:'move', acceptedIncomingType: this.state.shape.acceptedIncomingType, acceptedOutgoingType:this.state.shape.acceptedOutgoingType}
        auxSelectedShapeData.id = executionSpecificationShape.getShape().id;
        //auxSelectedShapeData.index = i 
        auxSelectedShapeData.type     = this.state.shape.type;   
        auxSelectedShapeData.subtype  = executionSpecificationShape.getShape().subtype;
        auxSelectedShapeData.position = executionSpecificationShape.getShape().position;
        auxSelectedShapeData.mx = this.state.shape.x;
        auxSelectedShapeData.my = this.state.shape.y;
        auxSelectedShapeData.mousestyle = this.state.shape.mousestyle;

        if( (higherY + executionSpecificationShape.getShape().height )> this.state.shape.verticalLine.y2)
            this.state.shape.verticalLine.y2 = higherY + executionSpecificationShape.getShape().height + 50

        return auxSelectedShapeData;
    }


    moveExecutionSpecifications(ctx, selectedShapeData, shapes, mx, my){
        for (var i = 0; i < this.state.executionSpecifications.length; i++){ 
            this.state.executionSpecifications[i].moveRequest(ctx, this, selectedShapeData, shapes, mx, my)
        }
    }

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
 
}