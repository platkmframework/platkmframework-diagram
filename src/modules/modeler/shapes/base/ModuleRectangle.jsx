import { ConnectorProcessor } from "../../connector/ConnectorProcessor"
import { C_MOUSE_STYLE_MOVE } from "../../constants/MouesStyleTypes"
import { C_BASE_LINE, C_BASE_RECTANGLE, C_DEFAULT_BORDER_MOVE_COLOR, C_SUBTYPE_EDGES } from "../../constants/ShapeTypes"
import { newSelectedShapeData } from "../../js/canvasDrawFunction"
import { generateKey } from "../../js/canvasScripts"
  
const C_DEFAULT_MIN_HEIGHT = 50
//const C_DEFAULT_COLOR  = '#cfe2ff'
const C_DEFAULT_COLOR  = '#ffff'

const DEFAULT_X = 770
const DEFAULT_y = 60 
const DEFAULT_height = 50
const DEFAULT_width  = 150

export class ModuleRectangle{

    constructor( ){
        this.state = {
            shape:{
                id:generateKey('RectangleShape_'),  
                x:DEFAULT_X, 
                y:DEFAULT_y, 
                height:DEFAULT_height, 
                width:DEFAULT_width,
                type:C_BASE_RECTANGLE,
                subtype:'', 
                label:'', 
                name:'', 
                color:C_DEFAULT_COLOR,
                mousestyle:C_MOUSE_STYLE_MOVE,
                acceptedIncomingType:[C_BASE_LINE],
                acceptedOutgoingType:[C_BASE_LINE],
                incoming:[],  
                outgoing:[],
                edges:[
                    {id:generateKey('edges_left_top_'), x:DEFAULT_X-5, y:DEFAULT_y-5, height:10, width:10, type:'edges', position:'left_top',mousestyle:'pointer'},
                    {id:generateKey('edges_right_top_'),x:DEFAULT_X + DEFAULT_width-5, y:DEFAULT_y-5, height:10, width:10, type:'edges', position:'right_top',mousestyle:'pointer'},
                    {id:generateKey('edges_left_bottom_'),x:DEFAULT_X-5, y:DEFAULT_y + DEFAULT_height -5, height:10, width:10, type:'edges', position:'left_bottom',mousestyle:'pointer'},
                    {id:generateKey('edges_right_bottom_'),x:DEFAULT_X + DEFAULT_width-5, y:DEFAULT_y + DEFAULT_height -5, height:10, width:10, type:'edges', position:'right_bottom',mousestyle:'pointer'},
                ],
                containerParentId:'',
                containerParentDistWidth:0,
                containerParentDistHeight:0,
                isContainer: true,
                containerAcceptedType:[C_BASE_RECTANGLE]
            },
            content:[], // se saca del json shape para poder hacer el clone
            connectors:[],
            connectorProcessor: new ConnectorProcessor()
        }
    }

    /*********************FUNCIONES GENERALES BASICAS */
    getShape(){
        return this.state.shape;
    }

    updateShpe(shape){
        this.state = {
            shape: {...shape},
        };
    }

    getXWidth(){
        return this.state.shape.x + this.state.shape.width
    }

    getYHeight(){
        return this.state.shape.y + this.state.shape.height
    }


    cloneElement(){
        let auxRectangleShape = new RectangleShape();
        auxRectangleShape.state.shape = structuredClone(this.state.shape) 
        return auxRectangleShape;
    }

//---------------------FUNCIONES DE MOVIMIENTO IMPLEMENTADAS POR TODAS LAS FIGURAS----------------- */
    /**
     * Dibujar la figura
     * @param {*} ctx 
     * @param {*} selectedShapeData 
     */
    draw(ctx, selectedShapeData, shapeList){  
       this.  drawUMLComponentWithSideRects(ctx,
        150, 100, // Position
        250, 150, // Width and height
        "ExampleComponent" // Component name
      );
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
                
                this.state.shape.y =   my - selectedShapeData.my
                this.state.shape.x =   mx - selectedShapeData.mx
                
                this.moveRequestEdges()
            }

            this.state.content.map(s=>s.moveRequest(ctx, this, selectedShapeData, shapes, mx, my))

            this.movingOutgingIncoming(shapes)

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
        
        let auxSelectedShapeData
        let auxEShape={id:''}
        /*         this.state.content.map((ed,j)=>{
            auxEShape = ed.getSelectedByMouseCoordinates(ctx, mx, my)
            if(auxEShape.id != ''){
                auxEShape = auxEShape;
            }
        }) */

        for (let index = 0; index < this.state.content.length; index++) {
            auxEShape = this.state.content[index].getSelectedByMouseCoordinates(ctx, mx, my)
            if(auxEShape.id != ''){
                auxSelectedShapeData = auxEShape;
            }
        }

        if(auxSelectedShapeData && auxSelectedShapeData.id != '') return auxSelectedShapeData;
        
        auxSelectedShapeData = newSelectedShapeData()
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
     *      //containerParentDistWidth
        //containerParentDistHeight
     * @param {*} element 
     */
    moveRequest(ctx, element, selectedShapeData, shapes, mx, my){ 
     //   console.log('move request', mx, my) 
        //this.state.shape.y =   this.state.shape.y - my
        this.state.shape.x =  element.getShape().x + this.state.shape.containerParentDistWidth
        this.state.shape.y =  element.getShape().y + this.state.shape.containerParentDistHeight
        this.moveRequestEdges()

        this.state.content.map(s=> s.moveRequest(ctx, this, selectedShapeData, shapes, mx, my))

        this.movingOutgingIncoming(shapes)

    }

    /**
     * Buscar si el id le pertenece o a algún hijo tipo figura principal
     * @param {*} id 
     * @returns 
     */
    findById(id){
        if(this.state.shape.id == id) return this;
        let element = null
        for (let index = 0; index < this.state.content.length; index++) {
            element = this.state.content[index].findById(id);
            if(element != null) index = this.state.content.length
        }
        return element;
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

        let auxEShape = null;
        for (let index = 0; index < this.state.content.length; index++) {
            auxEShape = this.state.content[index].findByCoordinatesAndAcceptanceType(ctx,mx, my, shapes, incomingType, byContainer, excluded);
            if(auxEShape != null) index = this.state.content.length
        }

        if(auxEShape && auxEShape!=null) return auxEShape;

        if(excluded && excluded.includes(this.state.shape.id)) return null;

        //console.log('ya busco adentro')

        if(mx>=this.state.shape.x && mx<=this.state.shape.x+this.state.shape.width && my>=this.state.shape.y && my<=this.state.shape.y+this.state.shape.height){
          //  console.log('y..encontro')
            if(byContainer){
                return this.state.shape.containerAcceptedType.includes(incomingType)?this:null
            }else{
                return this.state.shape.acceptedIncomingType.includes(incomingType)?this:null
            }
        }else return null;

    }

    //***************************CONTENT FUNCTIONS ****************/

    /**
     * el hijo de un contendor se mueve y manda al contenedor a ajustarse
     */
    adjustContent(){

        let biggerXWidth  = this.getXWidth();
        let biggerYHeight = this.getYHeight();
        
        let biggerWidth  = this.state.shape.width;
        let biggerHeight = this.state.shape.height;

        let biggerX = this.state.shape.x;
        let biggerY = this.state.shape.y;

        //shapes.map(s=>{
        this.state.content.map(s=>{
            //if(this.state.shape.content.includes(s.getShape().id)){
                if(s.getXWidth() > biggerXWidth){
                    biggerXWidth = s.getXWidth()
                    biggerWidth  = s.getXWidth() - this.state.shape.x
                }
                if(s.getYHeight() > biggerYHeight){
                    biggerYHeight = s.getYHeight()
                    biggerHeight  = s.getYHeight() - this.state.shape.y
                }
                if(s.getShape().y < biggerY){
                    biggerY = s.getShape().y
                    biggerHeight = biggerHeight +  this.state.shape.y - s.getShape().y
                }
                if(s.getShape().x < biggerX){
                    biggerX = s.getShape().x
                    biggerWidth = biggerWidth +  this.state.shape.x - s.getShape().x
                }
           //}
        })  
        this.state.shape.width  = biggerWidth;
        this.state.shape.height = biggerHeight; 
        
        this.state.shape.x = biggerX;
        this.state.shape.y = biggerY; 

        this.moveRequestEdges();
    }

    /**
     * se utiliza para eliminar cuaqluier elemento hijo
     * antes de que se elimine a el mimso
     */
    remove(data, parentRequest){
        //buscar las lineas outgoing e incoming y decirles que se eliminen
        
        for (var i = 0; i < data.shapes.length; i++){ 
            if(this.state.shape.outgoing.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }else if(this.state.shape.incoming.includes(data.shapes[i].getShape().id)){
                data.shapes.splice(i, 1)  
            }
        } 
    
        this.state.content.map(cs=> cs.remove(data, true)) 

        if(!parentRequest){ 
            if(this.state.shape.containerParentId != ''){
                console.log(222)
                let currentParentCont
                for (var i = 0; i < data.shapes.length; i++) { 
                    currentParentCont = data.shapes[i].findById(this.state.shape.containerParentId);
                    if(currentParentCont && currentParentCont != null) 
                        i = data.shapes.length
                }
                console.log(currentParentCont)
                currentParentCont.state.content = currentParentCont.state.content.filter(shape=> shape.getShape().id != this.state.shape.id)
                console.log('quedo..', currentParentCont.state.content)
            }else{
                data.shapes = data.shapes.filter(l=> l.getShape().id != this.getShape().id)
            }
        }
    
        return {shapes:data.shapes}
    }


    //************************CUSTOM FUNCTIONS ****************/

    moveEdges(selectedShapeData, shapes,  mx, my){ 
        this.state.shape.edges.filter(re=>{

            if(selectedShapeData.position == 'left_top'){
                    this.state.shape.height = this.state.shape.height  + this.state.shape.y - my; 
                    this.state.shape.width = this.state.shape.width + this.state.shape.x - mx;
                    this.state.shape.y = my;
                    this.state.shape.x = mx; 
                   
                
            }else if(selectedShapeData.position == 'right_top'  ){ 
                    this.state.shape.height = this.state.shape.height  + this.state.shape.y - my; 
                    this.state.shape.y = my; 
                    this.state.shape.width = mx - this.state.shape.x;
                 
            }else if(selectedShapeData.position  == 'left_bottom' && (my - this.state.shape.y) > C_DEFAULT_MIN_HEIGHT ){
                this.state.shape.width = this.state.shape.width + this.state.shape.x - mx;
                this.state.shape.height = my - this.state.shape.y;
                this.state.shape.x = mx;

            }else if(selectedShapeData.position  == 'right_bottom' && (my - this.state.shape.y) > C_DEFAULT_MIN_HEIGHT ){ 
                this.state.shape.height = my - this.state.shape.y;
                this.state.shape.width = mx - this.state.shape.x;
            }
            return re;
        })
       this.moveRequestEdges()
    }

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

    movingOutgingIncoming(shapes){
        if(shapes){
            this.state.shape.outgoing.map(lineId=>{
                //validate started point
                for (var i = 0; i < shapes.length; i++){ 
                    if(shapes[i].getShape().id == lineId){
                        shapes[i].state.shape.points[0].x = this.state.shape.x + this.state.shape.width/2
                        shapes[i].state.shape.points[0].y = this.state.shape.y + this.state.shape.height/2
                    }
                } 
            })
            this.state.shape.incoming.map(lineId=>{
                //validate end point
                for (var i = 0; i < shapes.length; i++){ 
                    if(shapes[i].getShape().id == lineId){
                        shapes[i].state.shape.points[1].x = this.state.shape.x + this.state.shape.width/2
                        shapes[i].state.shape.points[1].y = this.state.shape.y + this.state.shape.height/2
                    }
                } 
            })

        }
    }


    //---------------------
    drawUMLComponentWithSideRects(ctx, x, y, width, height, componentName) {
        const headerHeight = 40;
        const smallRectWidth = 20;
        const smallRectHeight = 10;
        const spacing = 15;
  
        // Draw outer rectangle for the component
        ctx.strokeRect(x, y, width, height);
  
        // Draw header rectangle
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(x, y, width, headerHeight);
        ctx.strokeRect(x, y, width, headerHeight);
  
        // Add component name in the header
        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(componentName, x + width / 2, y + headerHeight / 2);
  
        // Draw black rectangles over the vertical line
        const smallRectX = x - smallRectWidth / 2; // Centered over the left vertical line
        const firstRectY = y + headerHeight + spacing;
        const secondRectY = firstRectY + smallRectHeight + spacing;
  
        ctx.fillStyle = "#ffff";
        ctx.fillRect(smallRectX, firstRectY, smallRectWidth, smallRectHeight);
        ctx.strokeRect(smallRectX, firstRectY, smallRectWidth, smallRectHeight);
  
        ctx.fillRect(smallRectX, secondRectY, smallRectWidth, smallRectHeight);
        ctx.strokeRect(smallRectX, secondRectY, smallRectWidth, smallRectHeight);
      }
}