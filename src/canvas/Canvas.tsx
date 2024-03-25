import { useEffect, useRef, useState } from "react"
import { Button } from "react-bootstrap"
import Menu from "../menu/Menu";

type CanvasProps = {
    width:string
    height:string
}

interface VelocityType  {
    x:number,
    y:number
}

export type ThisCircleType = {
    x:number
    y:number
    velocity:VelocityType
    mass:number
    radius:number,
    minRadius:number
    color:string
    isMoving:boolean
    draw:()=>void
    update:(circles:Array<ThisCircleType>)=>void
}

const Canvas = ({width,height}: CanvasProps) => {
    //ссылка на canvas
    const refCanvas=useRef<HTMLCanvasElement>(null) 
    //ссылка на кнопку Играть
    const refStartBtn=useRef<HTMLButtonElement>(null)
    //ссылка на кнопку Выбрать цвета шаров
    const refStopBtn=useRef<HTMLButtonElement>(null)
    // управление открытием/закрытием меню выбора цвера шара 
    const [isMenu,setMenu]=useState<boolean>(false)
    // состояние цвета шара 
    const [ballColor,setBallColor]=useState<string>('')
    // ключ для определения, у какого шара нужно поменять цвет
    const [circleKey,setCircleKey]=useState<number>()
    // массив для хранения массива объектов с описанием параметров шаров
    const [circleArray,setCircleArray]=useState<Array<ThisCircleType>>([])
    // флаг запуска/приостановки игры
    let isPlaying=false
 
    useEffect(()=>{

        //получение значений объектов по ссылкам
        const startBtn=refStartBtn.current
        const stopBtn=refStopBtn.current
        const canvas = refCanvas.current

        if (canvas==null) return

        // получение контекста визуализации
        const ctx = canvas.getContext("2d");

        if (ctx==null) return

        //инициализация объекта с координатами положения мыши
        let mouse={
            x:0,
            y:0
        }
        // массив с начальными цветами шаров
        const colorArray=[
            '#ffaa33',
            '#99ffaa',
            '#00ff00',
            '#4411aa',
            '#ff1100'
        ]
        // начальный шаг движения шара по оси Х
        const moveX=2
         //начальный шаг движения шара по оси Y
        const moveY=2

        // функция для создания объекта с описанием параметров шара
        function Circle(this:ThisCircleType,x:number,y:number,radius:number):void {
            //координаты центра
            this.x=x
            this.y=y
            // скорость 
            this.velocity={
                x:moveX,
                y:moveY
            }
            //условная масса 
            this.mass=1
            // радиус
            this.radius=radius
            // цвет
            this.color=colorArray[Math.floor(Math.random()*colorArray.length)]

            // отрисовка окружности
            this.draw=function() {

                if (ctx==null) return
                
                ctx.beginPath()
                ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
                ctx.closePath()
                ctx.fillStyle=this.color
                ctx.fill();

            }

            // обновление положения шара
            this.update=(circles:ThisCircleType[])=> {
                //  шар отражается от стенки поля, меняя направление движения на противоположное
                if (this.x+this.radius>=Number(width) || this.x-this.radius<0){ 
                    this.velocity.x=-this.velocity.x
                }
                if (this.y+this.radius>=Number(height) || this.y-this.radius<0){ 
                    this.velocity.y=-this.velocity.y
                }

                this.draw()

                for (let i=0;i<circles.length;i++){

                    if (this===circles[i]) continue

                    // упругий удар шаров при соприкосновении
                    if (getDistance(this.x,this.y,circleArray[i].x,circleArray[i].y)-this.radius*2<0) {
                        resolveCollision(this,circleArray[i])
                    }

                }
                // движение шара
                this.x+=this.velocity.x
                this.y+=this.velocity.y   
            }
        }
        
        // измерение расстояния между двумя объектами
        function getDistance(x1:number,y1:number,x2:number,y2:number):number {
            let xDistance=x2-x1
            let yDistance=y2-y1

            return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance,2))
        }

        // изменение направления вектора скорости объекта
        function rotate(velocity:VelocityType, angle:number):VelocityType {
            const rotatedVelocities = {
                x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
                y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
            };
        
            return rotatedVelocities;
        }

        // функция, описывающая упругий удар двух шаров
        function resolveCollision(particle:any, otherParticle:any):void {

            // приведение шаров в движение
            particle.isMoving=true
            otherParticle.isMoving=true

            // разница скоростей шаров
            const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
            const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;
            
            // расстояние между центрами 
            const xDist = otherParticle.x - particle.x;
            const yDist = otherParticle.y - particle.y;
        
            // исключение случайного наложения двух шаров 
            if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        
                // угол между двумя сталкивающимися шарами
                const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);
        
                // массы шаров
                const m1 = particle.mass;
                const m2 = otherParticle.mass;

                // поворачиваем окружности на угол angle, чтобы центры окружностей лежали на одной оси
                //для применения формулы упругого удара
        
                // поворот окружностей
                const u1 = rotate(particle.velocity, angle);
                const u2 = rotate(otherParticle.velocity, angle);
        
                // первичное значение скоростей шаров после упругого столкновения и выравнивания окружностей
                const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
                const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };
        
                // финальные значения скоростей шаров после возрата осей в исходное положение
                const vFinal1 = rotate(v1, -angle);
                const vFinal2 = rotate(v2, -angle);
        
                // эффект упругого отталкивания шаров и замедление после столкновения
                particle.velocity.x = 0.7*vFinal1.x;
                particle.velocity.y = 0.7*vFinal1.y;
        
                otherParticle.velocity.x = 0.7*vFinal2.x;
                otherParticle.velocity.y = 0.7*vFinal2.y;

            }
        }

        // задание координат для дальнейшей отрисовки 12ти шаров
        const init=()=> {
            for (let i=0;i<12;i++) {
                const radius=Math.floor(Math.random()*20)+15
                let x=Math.random()*(Number(width)-radius*2)+radius
                let y=Math.random()*(Number(height)-radius*2)+radius
                circleArray.push(new (Circle as any)(x,y,radius) )
            }
        }

        // отрисовка шаров и анимирование движения в зависимости от флага isMoving
        const animate=()=>{
            requestAnimationFrame(animate) 
            ctx.fillStyle="green"
            ctx.fillRect(0,0,Number(width),Number(height))

            for (let i=0;i<circleArray.length;i++) {
                circleArray[i].draw()
                circleArray[i].isMoving && circleArray[i].update(circleArray)
            }
        }

        init()
        animate() 
        
        // при наведении мыши на шар он отскакивает в сторону от курсора
        canvas.addEventListener('mousemove',(e)=>{
            mouse.x=e.clientX
            mouse.y=e.clientY 
            
            circleArray.forEach((circle)=>{
                if (mouse.x <= (circle.x+circle.radius) && mouse.x > (circle.x-circle.radius) &&
                mouse.y <= (circle.y+circle.radius) && mouse.y > (circle.y-circle.radius)) {
                    if (isPlaying) {
                        circle.isMoving=true
                        circle.velocity.x=-2*Math.atan2(mouse.y-circle.y,mouse.x-circle.x)
                        circle.velocity.y=-2*Math.atan2(mouse.y-circle.y,mouse.x-circle.x)
                    }
                }
            })
        })  

        // если нажать кнопку Играть, шары начнуть движение при соприкосновении с курсором
        startBtn!==null && startBtn.addEventListener('click',()=>{
            isPlaying=true
        })

        // если нажать кнопку Выбрать цвет шаров, шары не будут двигаться при наведении курсора
        // что дает возможность выбрать их цвет при нажатии на шар
        stopBtn!==null && stopBtn.addEventListener('click',()=>{
            isPlaying=false
        })

        // при нажатии на шар открывается меню выбора его цвета
        canvas.addEventListener('click',()=>{
            
            circleArray.forEach((circle:ThisCircleType,i:number)=>{
                if (mouse.x <= (circle.x+circle.radius) && mouse.x > (circle.x-circle.radius) &&
                mouse.y <= (circle.y+circle.radius) && mouse.y > (circle.y-circle.radius)) {
                    setMenu(true)
                    setBallColor(circle.color)
                    setCircleKey(i)
                }
            })
        })

    },[])

  return (
    <>  
        <canvas id="canvas" style={{background:'green'}} ref={refCanvas} width={width} height={height}></canvas>
        {/* Меню выбора цвета шара , открывающееся при нажатии на шар */}
        {isMenu && <Menu circleKey={circleKey} circleArray={circleArray} ballColor={ballColor} setBallColor={setBallColor} setMenu={setMenu}/>}

        <div className="d-flex flex-column">
            <Button ref={refStartBtn} style={{width:'150px',height:'50px'}} className="mt-4 ">
            Играть
            </Button>
            <Button ref={refStopBtn} style={{width:'200px',height:'50px'}} className="mt-4 border-secondary bg-secondary">
            Выбрать цвет шаров
            </Button>
        </div>

        
    </>
  )
}

export default Canvas