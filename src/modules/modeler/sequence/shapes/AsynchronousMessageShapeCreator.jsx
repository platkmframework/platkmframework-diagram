import { generateKey } from "../../js/canvasScripts";
import { AsynchronousMessageShape } from "./AsynchronousMessageShape";

export class AsynchronousMessageShapeCreator{

    constructor(){ 
        this.state = {}
    } 

    init(shapes){
        this.state = {
            startShape:'',
            mx:'',
            my:'',
            endShape:'',
            type:'AsynchronousMessage',
            shape:{}, 
            selectedShapeData:{},
            shapes:shapes,
        }       
    }

    reset(){
        this.init([],[])
    }

    getShape(){
        return this.state.shape;
    }


    onMouseDown(event,  canvasRef, canvasRefOffScreen, selectedShapeData, draw2D){
        const BB = canvasRef.current.getBoundingClientRect();
        const mx = event.clientX - BB.left;
        const my = event.clientY - BB.top;

        let auxSelectedShapeData;
        let createLine = false;
        for (var i = 0; i < this.state.shapes.length; i++){ 
            auxSelectedShapeData = this.state.shapes[i].getSelectedByMouseCoordinates(canvasRefOffScreen.current.getContext('2d'), mx, my);
            if(auxSelectedShapeData.id != ''){
                if(this.state.startShape == '' &&  auxSelectedShapeData.acceptedOutgoingType.includes(this.state.type)){
                    this.state.startShape = auxSelectedShapeData.currentShape
                    this.state.mx = mx
                    this.state.my = my
/*                 }else if(auxSelectedShapeData.id == this.state.startShape.state.shape.id){
                    //pendiente relacion muchos a muchos
                    console.log('pendiente la relacion de muchos a muchos') */
                }else if(this.state.startShape != '' &&  auxSelectedShapeData.acceptedIncomingType.includes(this.state.type)){
                
                    createLine = true;
                }
                break;
            }
        }

        if(createLine){
          //  let sourceElement;
           // let targetElement;

            let lineId = generateKey('AsynchronousMessage_')
            this.state.startShape.state.shape.outgoing.push(lineId)
            auxSelectedShapeData.currentShape.state.shape.incoming.push(lineId)

/*             auxShapes = auxShapes.map((s)=>{
                if(s.getShape().id == this.state.startElementId){
                    s.getShape().outgoing.push(lineId) 
                    sourceElement = s;
                }else if(s.getShape().id == auxSelectedShapeData.id){
                    s.getShape().incoming.push(lineId) 
                    targetElement = s
                }
                return s;
            }) */


            let x1 = this.state.mx
            let y1 = this.state.my
            let x2 = mx
            let y2 = this.state.my

             if(x1 < x2){
                x1+=7,
                x2-=5 
             }else {
                x2+=7,
                x1-=5 
             }
           
 
            
            this.state.shape = new AsynchronousMessageShape(lineId,
                this.state.startShape.state.shape.id,
                auxSelectedShapeData.id,
                true, 
                'end', 
                x1,
                y1, 
                x2,
                y2
                )

                this.state.shapes.push(this.state.shape )

            let resultSelectedShapeData = {
                id:lineId, 
                type: this.state.type, 
                subtype:'', 
                mousestyle:'ponter', 
                moveStarted:false,
                acceptedIncomingType: this.state.shape.acceptedIncomingType, 
                acceptedOutgoingType:this.state.shape.acceptedOutgoingType
            }

            this.state.shape.selectedShapeData = resultSelectedShapeData;
 
        }

        return createLine;

    } 

    onMouseMove(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D){
        
        if(this.state.startShape != ''){

            const ctx = canvasRefOffScreen.current.getContext('2d')
            ctx.reset();
    
            const BB = canvasRef.current.getBoundingClientRect();
            const mx = event.clientX - BB.left;
            const my = event.clientY - BB.top;
    
            ctx.moveTo(this.state.mx, this.state.my); // Move the pen to (30, 50) 
            ctx.lineTo(mx, this.state.my); // Draw a line to (150, 100)
            ctx.stroke(); // Render the path
            draw2D(this.state.shapes, selectedShapeData)
        }

    } 


    onMouseUp(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D){
        
    } 

    onDoubleClick(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D){
        
    } 

    draw(event, canvasRef, canvasRefOffScreen, selectedShapeData, draw2D){


    }
}
