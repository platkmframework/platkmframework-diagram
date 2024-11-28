import { C_MOUSE_STYLE_MOVE } from "../../constants/MouesStyleTypes"
import { C_ASYNCHRONOUS_MESSAGE, C_EXECUTION_SPECIFICATION, C_SUBTYPE_EDGES, C_DEFAULT_BORDER_MOVE_COLOR, C_DEFAULT_CONNECTION_COLOR} from "../../constants/ShapeTypes"
import { ConnectorProcessor} from "../../connector/ConnectorProcessor"
import { generateKey, intersectionRectByLine} from "../../js/canvasScripts"
import {ExeSpecificationAsynMessageConnector} from "../connector/ExeSpecificationAsynMessageConnector"
import { newSelectedShapeData } from "../../js/canvasDrawFunction"

const C_DEFAULT_HEIGHT = 100
const C_DEFAULT_WIDTH  = 20
const C_DEFAULT_MIN_HEIGHT = 50
const C_DEFAULT_COLOR  = '#cfe2ff'

export class ExecutionSpecificationShape{

    constructor(parentId, x, y){
        this.state = {
            shape:{
                id:generateKey('ExecutionSpecification_'), 
                parentId:parentId,
                x:x, 
                y:y, 
                height:C_DEFAULT_HEIGHT, 
                width:C_DEFAULT_WIDTH, 
                type:C_EXECUTION_SPECIFICATION,
                subtype:'', 
                label:'', 
                name:'', 
                color:C_DEFAULT_COLOR,
                mousestyle:C_MOUSE_STYLE_MOVE,
                acceptedIncomingType:[C_ASYNCHRONOUS_MESSAGE],
                acceptedOutgoingType:[C_ASYNCHRONOUS_MESSAGE],
                incoming:[],  
                outgoing:[], 
                containerParentId:'',
                isContainer: false,
                containerAcceptedType:[],
                edges:[
                            {id:generateKey('edges_left_top_'), x:x-5, y:y-5, height:10, width:10, type:C_SUBTYPE_EDGES, position:'left_top',mousestyle:'pointer'},
                            {id:generateKey('edges_right_top_'),x:x + C_DEFAULT_WIDTH-5, y:y-5, height:10, width:10, type:C_SUBTYPE_EDGES, position:'right_top',mousestyle:'pointer'},
                            {id:generateKey('edges_left_bottom_'),x:x-5, y:y + C_DEFAULT_HEIGHT -5, height:10, width:10, type:C_SUBTYPE_EDGES, position:'left_bottom',mousestyle:'pointer'},
                            {id:generateKey('edges_right_bottom_'),x:x + C_DEFAULT_WIDTH-5, y:y + C_DEFAULT_HEIGHT -5, height:10, width:10, type:C_SUBTYPE_EDGES, position:'right_bottom',mousestyle:'pointer'},
                        ]
            },
            content:[], // se saca del json shape para poder hacer el clone
            connectors:[new ExeSpecificationAsynMessageConnector()],
            connectorProcessor: new ConnectorProcessor()
        }
    }

    getShape(){
        return this.state.shape;
    }

    updateShpe(shape){
        this.state = {
            shape: {...shape},
          };
    }

    cloneElement(){
        let executionSpecificationShape = new ExecutionSpecificationShape();
        executionSpecificationShape.state.shape = structuredClone(this.state.shape) 
        
        return executionSpecificationShape;
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
         
        let allowContain = this.state.connectorProcessor.process(ctx,
            this.state.connectors, 
            selectedShapeData, 
            this);
            
        ctx.beginPath();
        ctx.fillStyle   = this.state.shape.color;
        ctx.strokeStyle = (selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted)?
        C_DEFAULT_BORDER_MOVE_COLOR:allowContain!=null?C_DEFAULT_CONNECTION_COLOR:this.state.shape.color; 

        ctx.roundRect(this.state.shape.x, this.state.shape.y, this.state.shape.width, this.state.shape.height, 5)
        //const a = new Path2D()
        //a.rect(this.state.shape.x, this.state.shape.y, this.state.shape.width, this.state.shape.height)  
        ctx.fill()
        ctx.stroke() 

        if(selectedShapeData.id == this.state.shape.id){
            this.state.shape.edges.map(re=>{
                ctx.fillStyle = selectedShapeData.id == this.state.shape.id && selectedShapeData.moveStarted?C_DEFAULT_BORDER_MOVE_COLOR:'black';
                ctx.beginPath();
                ctx.fillRect(re.x, re.y, re.width, re.height)  
                ctx.stroke();
            })
        }
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
        
        this.state.connectorProcessor.finishProcess(ctx,
            this.state.connectors, 
            selectedShapeData, 
            shapes); 
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

        if(selectedShapeData.id == this.state.shape.id){
            if(selectedShapeData.subtype == C_SUBTYPE_EDGES)
                this.moveEdges(selectedShapeData, shapes, mx, my)
            else{
                const parentShape = shapes.find(s=>s.getShape().id == selectedShapeData.parentId).getShape()
                const parentVerticalLineY2 = parentShape.verticalLine.y2
                if( (parentShape.y + parentShape.height + 20) <  (my - selectedShapeData.my)){

                    if(parentVerticalLineY2 < (this.state.shape.height +  my - selectedShapeData.my)){
                        parentShape.verticalLine.y2 = (this.state.shape.height +  my - selectedShapeData.my) + 10
                    }

                    if(this.state.shape.outgoing.length ==0 && this.state.shape.incoming.length==0 ){
                        this.state.shape.y = my - selectedShapeData.my

                    }
                    
                }

                this.state.shape.y =   my - selectedShapeData.my
                this.moveRequestEdges()
 
            }
            return true
        }return false
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
       //let auxSelectedShapeData = {id:'', type:'', parentId:this.state.shape.parentId,  subtypeId:'', subtype:'', mousestyle:C_MOUSE_STYLE_MOVE, acceptedIncomingType: this.state.shape.acceptedIncomingType, acceptedOutgoingType:this.state.shape.acceptedOutgoingType}
        
       let auxSelectedShapeData = newSelectedShapeData()
       auxSelectedShapeData.parentId   = this.state.shape.parentId
       auxSelectedShapeData.mousestyle = C_MOUSE_STYLE_MOVE
       auxSelectedShapeData.acceptedIncomingType = this.state.shape.acceptedIncomingType
       auxSelectedShapeData.acceptedOutgoingType = this.state.shape.acceptedOutgoingType

        if(mx>=this.state.shape.x && mx<=this.state.shape.x+this.state.shape.width && my>=this.state.shape.y && my<=this.state.shape.y+this.state.shape.height){
            auxSelectedShapeData.id        = this.state.shape.id;
            auxSelectedShapeData.type      = this.state.shape.type;
            auxSelectedShapeData.mx = mx - this.state.shape.x;
            auxSelectedShapeData.my = my - this.state.shape.y;
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
                    auxSelectedShapeData.mousestyle = ed.mousestyle;
                    auxSelectedShapeData.currentShape = this
                    auxSelectedShapeData.shape = this.cloneElement()
                }
            })
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
        this.state.shape.x = element.state.shape.x - 10 + element.state.shape.width/2
        this.moveRequestEdges()

        if(shapes){
            this.state.shape.outgoing.map(lineId=>{
                //validate started point
                for (var i = 0; i < shapes.length; i++){ 
                    if(shapes[i].getShape().id == lineId){
                        
                        let x1 = shapes[i].state.shape.points[0].x
                        let x2 = shapes[i].state.shape.points[1].x
                        if(x1 < x2){ 
                            shapes[i].state.shape.points[0].x = this.state.shape.x + 20
                         }else { 
                            shapes[i].state.shape.points[0].x = this.state.shape.x
                         }
                        
                    }
                } 
                
            })
            this.state.shape.incoming.map(lineId=>{
                //validate end point
                for (var i = 0; i < shapes.length; i++){ 
                    if(shapes[i].getShape().id == lineId){

                        let x1 = shapes[i].state.shape.points[0].x
                        let x2 = shapes[i].state.shape.points[1].x
                        if(x1 > x2){  
                            shapes[i].state.shape.points[1].x = this.state.shape.x + 20
                         }else {  
                            shapes[i].state.shape.points[1].x = this.state.shape.x
                         }
                    }
                } 
            })

        }
    }


    /**
     * Buscar si el id le pertenece o a algún hijo tipo figura principal
     * @param {*} id 
     * @returns 
     */
    findById(id){
        if(this.state.shape.id == id) return this; else return null;
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
    findByCoordinatesAndAcceptanceType(ctx, mx, my, shapes, incomingType, byContainer, excluded){
        return((mx>=this.state.shape.x && mx<=this.state.shape.x+this.state.shape.width && my>=this.state.shape.y && my<=this.state.shape.y+this.state.shape.height)
         &&
        !byContainer &&
        this.state.shape.acceptedIncomingType.includes(incomingType))?this: null;
    }


    /**
     * se utiliza para eliminar cuaqluier elemento hijo
     * antes de que se elimine a el mimso
     */
    remove(data){
        //buscar las lineas outgoing e incoming y decirles que se eliminen
        
        for (var i = 0; i < data.shapes.length; i++){ 
            if(this.state.shape.outgoing.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }else if(this.state.shape.incoming.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }
        } 
        const parentShape = data.shapes.find(s=>s.getShape().id == this.getShape().parentId)
        parentShape.state.executionSpecifications = parentShape.state.executionSpecifications.filter(es=> es.getShape().id != this.getShape().id)

       // let shapes = data.shapes.filter(s=> s.getShape().id != this.getShape().id)
        return {shapes:data.shapes}
    }

    //---------------------END FUNCIONES IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */

   //************************CUSTOM FUNCTIONS ****************/
   moveRequestEdges(){ 
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

    moveEdges(selectedShapeData, shapes, mx, my){
        const parentShape = shapes.find(s=>s.getShape().id == selectedShapeData.parentId).getShape()
        const parentVerticalLineY2 = parentShape.verticalLine.y2
        this.state.shape.edges.filter(re=>{

            if(selectedShapeData.position == 'left_top'){
                if( (parentShape.y + parentShape.height + 20) < my  && (this.state.shape.height  + this.state.shape.y - my) > C_DEFAULT_MIN_HEIGHT){
                    this.state.shape.height = this.state.shape.height  + this.state.shape.y - my; 
                    this.state.shape.y = my;
                }
            }else if(selectedShapeData.position == 'right_top' && (this.state.shape.height  + this.state.shape.y - my) > C_DEFAULT_MIN_HEIGHT){
                if( (parentShape.y + parentShape.height + 20) < my && (this.state.shape.height  + this.state.shape.y - my) > C_DEFAULT_MIN_HEIGHT){
                    this.state.shape.height = this.state.shape.height  + this.state.shape.y - my; 
                    this.state.shape.y = my; 
                }
            }else if(selectedShapeData.position  == 'left_bottom' && (my - this.state.shape.y) > C_DEFAULT_MIN_HEIGHT ){
                this.state.shape.height = my - this.state.shape.y;

                if(parentVerticalLineY2 < (this.state.shape.y + this.state.shape.height)){
                    parentShape.verticalLine.y2 = (this.state.shape.y + this.state.shape.height) + 10
                }

            }else if(selectedShapeData.position  == 'right_bottom' && (my - this.state.shape.y) > C_DEFAULT_MIN_HEIGHT ){ 
                this.state.shape.height = my - this.state.shape.y;

                if(parentVerticalLineY2 < (this.state.shape.y + this.state.shape.height)){
                    parentShape.verticalLine.y2 = (this.state.shape.y + this.state.shape.height) + 10
                }
            }
            return re;
        })
       this.moveRequestEdges()
    }

}