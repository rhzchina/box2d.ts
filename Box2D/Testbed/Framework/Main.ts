import * as box2d from "../../Box2D/Box2D";
import { Settings, Test } from "./Test";
import { g_debugDraw, g_camera } from "./DebugDraw";
import { g_testEntries } from "../Tests/TestEntries";
///#if B2_ENABLE_PARTICLE
import { FullScreenUI } from "./FullscreenUI";
import { ParticleParameter } from "./ParticleParameter";
///#endif

export class Main {
  ///#if B2_ENABLE_PARTICLE
  public static fullscreenUI = new FullScreenUI();
  public static particleParameter = new ParticleParameter();
  ///#endif
  public m_time_last: number = 0;
  public m_fps_time: number = 0;
  public m_fps_frames: number = 0;
  public m_fps: number = 0;
  public m_fps_div: HTMLDivElement;
  public m_debug_div: HTMLDivElement;
  public m_settings: Settings = new Settings();
  public m_test: Test;
  public m_test_index: number = 0;
  public m_test_select: HTMLSelectElement;
  public m_shift: boolean = false;
  public m_ctrl: boolean = false;
  public m_lMouseDown: boolean = false;
  public m_rMouseDown: boolean = false;
  public m_projection0: box2d.b2Vec2 = new box2d.b2Vec2();
  public m_viewCenter0: box2d.b2Vec2 = new box2d.b2Vec2();
  public m_demo_mode: boolean = false;
  public m_demo_time: number = 0;
  public m_max_demo_time: number = 1000 * 10;
  public m_canvas_div: HTMLDivElement;
  public m_canvas: HTMLCanvasElement;
  public m_ctx: CanvasRenderingContext2D;
  public m_demo_button: HTMLInputElement;

  constructor() {
    const fps_div: HTMLDivElement = this.m_fps_div = <HTMLDivElement> document.body.appendChild(document.createElement("div"));
    fps_div.style.position = "absolute";
    fps_div.style.left = "0px";
    fps_div.style.bottom = "0px";
    fps_div.style.backgroundColor = "rgba(0,0,255,0.75)";
    fps_div.style.color = "white";
    fps_div.style.font = "10pt Courier New";
    fps_div.style.zIndex = "256";
    fps_div.innerHTML = "FPS";

    const debug_div: HTMLDivElement = this.m_debug_div = <HTMLDivElement> document.body.appendChild(document.createElement("div"));
    debug_div.style.position = "absolute";
    debug_div.style.left = "0px";
    debug_div.style.bottom = "0px";
    debug_div.style.backgroundColor = "rgba(0,0,255,0.75)";
    debug_div.style.color = "white";
    debug_div.style.font = "10pt Courier New";
    debug_div.style.zIndex = "256";
    debug_div.innerHTML = "";

    document.body.style.backgroundColor = "black";

    const main_div: HTMLDivElement = <HTMLDivElement> document.body.appendChild(document.createElement("div"));
    main_div.style.position = "absolute"; // relative to document.body
    main_div.style.left = "0px";
    main_div.style.top = "0px";

    function resize_main_div(): void {
      // console.log(window.innerWidth + "x" + window.innerHeight);
      main_div.style.width = window.innerWidth + "px";
      main_div.style.height = window.innerHeight + "px";
    }
    window.addEventListener("resize", (e: UIEvent): void => { resize_main_div(); });
    window.addEventListener("orientationchange", (e: Event): void => { resize_main_div(); });
    resize_main_div();

    const title_div: HTMLDivElement = <HTMLDivElement> main_div.appendChild(document.createElement("div"));
    title_div.style.textAlign = "center";
    title_div.style.color = "grey";
    title_div.innerHTML = "Box2D Testbed version " + box2d.b2_version + " (revision " + box2d.b2_changelist + ")";

    const view_div: HTMLDivElement = <HTMLDivElement> main_div.appendChild(document.createElement("div"));

    const canvas_div: HTMLDivElement = this.m_canvas_div = <HTMLDivElement> view_div.appendChild(document.createElement("div"));
    canvas_div.style.position = "absolute"; // relative to view_div
    canvas_div.style.left = "0px";
    canvas_div.style.right = "0px";
    canvas_div.style.top = "0px";
    canvas_div.style.bottom = "0px";

    const canvas: HTMLCanvasElement = this.m_canvas = <HTMLCanvasElement> canvas_div.appendChild(document.createElement("canvas"));

    function resize_canvas(): void {
      ///console.log(canvas_div.clientWidth + "x" + canvas_div.clientHeight);
      if (canvas.width !== canvas_div.clientWidth) {
        g_camera.m_width = canvas.width = canvas_div.clientWidth;
      }
      if (canvas.height !== canvas_div.clientHeight) {
        g_camera.m_height = canvas.height = canvas_div.clientHeight;
      }
    }
    window.addEventListener("resize", (e: UIEvent): void => { resize_canvas(); });
    window.addEventListener("orientationchange", (e: Event): void => { resize_canvas(); });
    resize_canvas();

    g_debugDraw.m_ctx = this.m_ctx = <CanvasRenderingContext2D> this.m_canvas.getContext("2d");

    const controls_div: HTMLDivElement = <HTMLDivElement> view_div.appendChild(document.createElement("div"));
    controls_div.style.position = "absolute"; // relative to view_div
    controls_div.style.backgroundColor = "rgba(255,255,255,0.5)";
    controls_div.style.padding = "8px";
    controls_div.style.right = "0px";
    controls_div.style.top = "0px";
    controls_div.style.bottom = "0px";
    controls_div.style.overflowY = "scroll";

    // tests select box
    controls_div.appendChild(document.createTextNode("Tests"));
    controls_div.appendChild(document.createElement("br"));
    const test_select: HTMLSelectElement = document.createElement("select");
    for (let i: number = 0; i < g_testEntries.length; ++i) {
      const option: HTMLOptionElement = document.createElement("option");
      option.text = g_testEntries[i].name;
      option.value = i.toString();
      test_select.add(option);
    }
    test_select.selectedIndex = this.m_test_index;
    test_select.addEventListener("change", (e: Event): void => {
      this.m_test_index = test_select.selectedIndex;
      this.LoadTest();
    });
    controls_div.appendChild(test_select);
    this.m_test_select = test_select;
    controls_div.appendChild(document.createElement("br"));

    controls_div.appendChild(document.createElement("hr"));

    // simulation number inputs
    function connect_number_input(parent: Node, label: string, init: number, update: (value: number) => void, min: number, max: number, step: number): HTMLInputElement {
      const number_input_tr: HTMLTableRowElement = <HTMLTableRowElement> parent.appendChild(document.createElement("tr"));
      const number_input_td0: HTMLTableDataCellElement = <HTMLTableDataCellElement> number_input_tr.appendChild(document.createElement("td"));
      number_input_td0.align = "right";
      number_input_td0.appendChild(document.createTextNode(label));
      const number_input_td1: HTMLTableDataCellElement = <HTMLTableDataCellElement> number_input_tr.appendChild(document.createElement("td"));
      const number_input: HTMLInputElement = document.createElement("input");
      number_input.size = 8;
      number_input.min = min.toString();
      number_input.max = max.toString();
      number_input.step = step.toString();
      number_input.value = init.toString();
      number_input.addEventListener("change", (e: Event): void => {
        update(parseInt(number_input.value, 10));
      });
      number_input_td1.appendChild(number_input);
      return number_input;
    }

    const number_input_table: HTMLTableElement = <HTMLTableElement> controls_div.appendChild(document.createElement("table"));
    connect_number_input(number_input_table, "Vel Iters", this.m_settings.velocityIterations, (value: number): void => { this.m_settings.velocityIterations = value; }, 1, 20, 1);
    connect_number_input(number_input_table, "Pos Iters", this.m_settings.positionIterations, (value: number): void => { this.m_settings.positionIterations = value; }, 1, 20, 1);
    ///#if B2_ENABLE_PARTICLE
    connect_number_input(number_input_table, "Pcl Iters", this.m_settings.particleIterations, (value: number): void => { this.m_settings.particleIterations = value; }, 1, 100, 1);
    ///#endif
    connect_number_input(number_input_table, "Hertz", this.m_settings.hz, (value: number): void => { this.m_settings.hz = value; }, 10, 120, 1);

    // simulation checkbox inputs
    function connect_checkbox_input(parent: Node, label: string, init: boolean, update: (value: boolean) => void): HTMLInputElement {
      const checkbox_input: HTMLInputElement = document.createElement("input");
      checkbox_input.type = "checkbox";
      checkbox_input.checked = init;
      checkbox_input.addEventListener("click", (e: MouseEvent): void => {
        update(checkbox_input.checked);
      });
      parent.appendChild(checkbox_input);
      parent.appendChild(document.createTextNode(label));
      parent.appendChild(document.createElement("br"));
      return checkbox_input;
    }

    connect_checkbox_input(controls_div, "Sleep", this.m_settings.enableSleep, (value: boolean): void => { this.m_settings.enableSleep = value; });
    connect_checkbox_input(controls_div, "Warm Starting", this.m_settings.enableWarmStarting, (value: boolean): void => { this.m_settings.enableWarmStarting = value; });
    connect_checkbox_input(controls_div, "Time of Impact", this.m_settings.enableContinuous, (value: boolean): void => { this.m_settings.enableContinuous = value; });
    connect_checkbox_input(controls_div, "Sub-Stepping", this.m_settings.enableSubStepping, (value: boolean): void => { this.m_settings.enableSubStepping = value; });
    ///#if B2_ENABLE_PARTICLE
    connect_checkbox_input(controls_div, "Strict Particle/Body Contacts", this.m_settings.strictContacts, (value: boolean): void => { this.m_settings.strictContacts = value; });
    ///#endif

    // draw checkbox inputs
    const draw_fieldset: HTMLFieldSetElement = <HTMLFieldSetElement> controls_div.appendChild(document.createElement("fieldset"));
    const draw_legend: HTMLLegendElement = <HTMLLegendElement> draw_fieldset.appendChild(document.createElement("legend"));
    draw_legend.appendChild(document.createTextNode("Draw"));
    connect_checkbox_input(draw_fieldset, "Shapes", this.m_settings.drawShapes, (value: boolean): void => { this.m_settings.drawShapes = value; });
    ///#if B2_ENABLE_PARTICLE
    connect_checkbox_input(draw_fieldset, "Particles", this.m_settings.drawParticles, (value: boolean): void => { this.m_settings.drawParticles = value; });
    ///#endif
    connect_checkbox_input(draw_fieldset, "Joints", this.m_settings.drawJoints, (value: boolean): void => { this.m_settings.drawJoints = value; });
    connect_checkbox_input(draw_fieldset, "AABBs", this.m_settings.drawAABBs, (value: boolean): void => { this.m_settings.drawAABBs = value; });
    connect_checkbox_input(draw_fieldset, "Contact Points", this.m_settings.drawContactPoints, (value: boolean): void => { this.m_settings.drawContactPoints = value; });
    connect_checkbox_input(draw_fieldset, "Contact Normals", this.m_settings.drawContactNormals, (value: boolean): void => { this.m_settings.drawContactNormals = value; });
    connect_checkbox_input(draw_fieldset, "Contact Impulses", this.m_settings.drawContactImpulse, (value: boolean): void => { this.m_settings.drawContactImpulse = value; });
    connect_checkbox_input(draw_fieldset, "Friction Impulses", this.m_settings.drawFrictionImpulse, (value: boolean): void => { this.m_settings.drawFrictionImpulse = value; });
    connect_checkbox_input(draw_fieldset, "Center of Masses", this.m_settings.drawCOMs, (value: boolean): void => { this.m_settings.drawCOMs = value; });
    connect_checkbox_input(draw_fieldset, "Statistics", this.m_settings.drawStats, (value: boolean): void => { this.m_settings.drawStats = value; });
    connect_checkbox_input(draw_fieldset, "Profile", this.m_settings.drawProfile, (value: boolean): void => { this.m_settings.drawProfile = value; });

    // simulation buttons
    function connect_button_input(parent: Node, label: string, callback: (e: MouseEvent) => void): HTMLInputElement {
      const button_input: HTMLInputElement = document.createElement("input");
      button_input.type = "button";
      button_input.style.width = "100";
      button_input.value = label;
      button_input.addEventListener("click", callback);
      parent.appendChild(button_input);
      parent.appendChild(document.createElement("br"));
      return button_input;
    }

    const button_div: HTMLDivElement = <HTMLDivElement> controls_div.appendChild(document.createElement("div"));
    button_div.align = "center";
    connect_button_input(button_div, "Pause", (e: MouseEvent): void => { this.Pause(); });
    connect_button_input(button_div, "Step", (e: MouseEvent): void => { this.SingleStep(); });
    connect_button_input(button_div, "Restart", (e: MouseEvent): void => { this.LoadTest(); });
    this.m_demo_button = connect_button_input(button_div, "Demo", (e: MouseEvent): void => { this.ToggleDemo(); });

    // disable context menu to use right-click
    window.addEventListener("contextmenu", (e: MouseEvent): void => { e.preventDefault(); }, true);

    canvas_div.addEventListener("mousemove", (e: MouseEvent): void => { this.HandleMouseMove(e); });
    canvas_div.addEventListener("mousedown", (e: MouseEvent): void => { this.HandleMouseDown(e); });
    canvas_div.addEventListener("mouseup", (e: MouseEvent): void => { this.HandleMouseUp(e); });
    canvas_div.addEventListener("mousewheel", (e: WheelEvent): void => { this.HandleMouseWheel(e); });

    canvas_div.addEventListener("touchmove", (e: TouchEvent): void => { this.HandleTouchMove(e); });
    canvas_div.addEventListener("touchstart", (e: TouchEvent): void => { this.HandleTouchStart(e); });
    canvas_div.addEventListener("touchend", (e: TouchEvent): void => { this.HandleTouchEnd(e); });

    window.addEventListener("keydown", (e: KeyboardEvent): void => { this.HandleKeyDown(e); });
    window.addEventListener("keyup", (e: KeyboardEvent): void => { this.HandleKeyUp(e); });

    this.LoadTest();

    this.m_time_last = Date.now();
  }

  public HomeCamera(): void {
    g_camera.m_zoom = (this.m_test) ? (this.m_test.GetDefaultViewZoom()) : (1.0);
    g_camera.m_center.Set(0, 20 * g_camera.m_zoom);
    ///g_camera.m_roll.SetAngle(box2d.b2DegToRad(0));
  }

  public MoveCamera(move: box2d.b2Vec2): void {
    const position: box2d.b2Vec2 = g_camera.m_center.Clone();
    ///move.SelfRotate(g_camera.m_roll.GetAngle());
    position.SelfAdd(move);
    g_camera.m_center.Copy(position);
  }

  ///public RollCamera(roll: number): void {
  ///  const angle: number = g_camera.m_roll.GetAngle();
  ///  g_camera.m_roll.SetAngle(angle + roll);
  ///}

  public ZoomCamera(zoom: number): void {
    g_camera.m_zoom *= zoom;
    g_camera.m_zoom = box2d.b2Clamp(g_camera.m_zoom, 0.02, 20);
  }

  private m_mouse = new box2d.b2Vec2();

  public HandleMouseMove(e: MouseEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.clientX, e.clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    this.m_mouse.Copy(element);

    if (this.m_lMouseDown) {
      this.m_test.MouseMove(world);
    }

    if (this.m_rMouseDown) {
      // m_center = viewCenter0 - (projection - projection0);
      const projection: box2d.b2Vec2 = g_camera.ConvertElementToProjection(element, new box2d.b2Vec2());
      const diff: box2d.b2Vec2 = box2d.b2Vec2.SubVV(projection, this.m_projection0, new box2d.b2Vec2());
      const center: box2d.b2Vec2 = box2d.b2Vec2.SubVV(this.m_viewCenter0, diff, new box2d.b2Vec2());
      g_camera.m_center.Copy(center);
    }
  }

  public HandleMouseDown(e: MouseEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.clientX, e.clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    switch (e.which) {
    case 1: // left mouse button
      this.m_lMouseDown = true;
      if (this.m_shift) {
        this.m_test.ShiftMouseDown(world);
      } else {
        this.m_test.MouseDown(world);
      }
      break;
    case 3: // right mouse button
      this.m_rMouseDown = true;
      const projection: box2d.b2Vec2 = g_camera.ConvertElementToProjection(element, new box2d.b2Vec2());
      this.m_projection0.Copy(projection);
      this.m_viewCenter0.Copy(g_camera.m_center);
      break;
    }
  }

  public HandleMouseUp(e: MouseEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.clientX, e.clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());

    switch (e.which) {
    case 1: // left mouse button
      this.m_lMouseDown = false;
      this.m_test.MouseUp(world);
      break;
    case 3: // right mouse button
      this.m_rMouseDown = false;
      break;
    }
  }

  public HandleTouchMove(e: TouchEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.touches[0].clientX, e.touches[0].clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());
    this.m_test.MouseMove(world);
    e.preventDefault();
  }

  public HandleTouchStart(e: TouchEvent): void {
    const element: box2d.b2Vec2 = new box2d.b2Vec2(e.touches[0].clientX, e.touches[0].clientY);
    const world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(element, new box2d.b2Vec2());
    this.m_test.MouseDown(world);
    e.preventDefault();
  }

  public HandleTouchEnd(e: TouchEvent): void {
    this.m_test.MouseUp(this.m_test.m_mouseWorld);
    e.preventDefault();
  }

  public HandleMouseWheel(e: MouseWheelEvent): void {
    if (e.wheelDelta > 0) {
      this.ZoomCamera(1 / 1.1);
    } else if (e.wheelDelta < 0) {
      this.ZoomCamera(1.1);
    }
    e.preventDefault();
  }

  public HandleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
    case "Control":
      this.m_ctrl = true;
      break;
    case "Shift":
      this.m_shift = true;
      break;
    case "ArrowLeft":
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(2, 0));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(-0.5, 0));
      }
      break;
    case "ArrowRight":
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(-2, 0));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0.5, 0));
      }
      break;
    case "ArrowDown":
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(0, 2));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0, -0.5));
      }
      break;
    case "ArrowUp":
      if (this.m_ctrl) {
        if (this.m_test) {
          this.m_test.ShiftOrigin(new box2d.b2Vec2(0, -2));
        }
      } else {
        this.MoveCamera(new box2d.b2Vec2(0, 0.5));
      }
      break;
    case "Home":
      this.HomeCamera();
      break;
    ///case "PageUp":
    ///  this.RollCamera(box2d.b2DegToRad(-1));
    ///  break;
    ///case "PageDown":
    ///  this.RollCamera(box2d.b2DegToRad(1));
    ///  break;
    case "z":
      this.ZoomCamera(1.1);
      break;
    case "x":
      this.ZoomCamera(0.9);
      break;
    case "r":
      this.LoadTest();
      break;
    case " ":
      if (this.m_test) {
        this.m_test.LaunchBomb();
      }
      break;
    case "p":
      this.Pause();
      break;
    case "[":
      this.DecrementTest();
      break;
    case "]":
      this.IncrementTest();
      break;
    ///#if B2_ENABLE_PARTICLE
    case ",":
      if (this.m_shift) {
        // Press < to select the previous particle parameter setting.
        Main.particleParameter.Decrement();
      }
      break;
    case ".":
      if (this.m_shift) {
        // Press > to select the next particle parameter setting.
        Main.particleParameter.Increment();
      } else {
        this.SingleStep();
      }
      break;
    ///#else
    ///case ".":
    ///  this.SingleStep();
    ///  break;
    ///#endif
    default:
      // console.log(e.keyCode);
      break;
    }

    if (this.m_test) {
      this.m_test.Keyboard(e.key);
    }
  }

  public HandleKeyUp(e: KeyboardEvent): void {
    switch (e.key) {
    case "Control":
      this.m_ctrl = false;
      break;
    case "Shift":
      this.m_shift = false;
      break;
    default:
      // console.log(e.keyCode);
      break;
    }

    if (this.m_test) {
      this.m_test.KeyboardUp(e.key);
    }
  }

  public UpdateTest(time_elapsed: number): void {
    if (this.m_demo_mode) {
      this.m_demo_time += time_elapsed;

      if (this.m_demo_time > this.m_max_demo_time) {
        this.IncrementTest();
      }

      const str: string = ((500 + this.m_max_demo_time - this.m_demo_time) / 1000).toFixed(0).toString();
      this.m_demo_button.value = str;
    } else {
      this.m_demo_button.value = "Demo";
    }
  }

  public DecrementTest(): void {
    if (this.m_test_index <= 0) {
      this.m_test_index = g_testEntries.length;
    }
    this.m_test_index--;
    this.m_test_select.selectedIndex = this.m_test_index;
    this.LoadTest();
  }

  public IncrementTest(): void {
    this.m_test_index++;
    if (this.m_test_index >= g_testEntries.length) {
      this.m_test_index = 0;
    }
    this.m_test_select.selectedIndex = this.m_test_index;
    this.LoadTest();
  }

  public LoadTest(restartTest: boolean = false): void {
    ///#if B2_ENABLE_PARTICLE
    Main.fullscreenUI.Reset();
    if (!restartTest) Main.particleParameter.Reset();
    ///#endif
    this.m_demo_time = 0;
    ///#if B2_ENABLE_PARTICLE
    if (this.m_test) {
      this.m_test.RestoreParticleParameters();
    }
    ///#endif
    this.m_test = g_testEntries[this.m_test_index].createFcn();
    if (!restartTest) {
      this.HomeCamera();
    }
  }

  public Pause(): void {
    this.m_settings.pause = !this.m_settings.pause;
  }

  public SingleStep(): void {
    this.m_settings.pause = true;
    this.m_settings.singleStep = true;
  }

  public ToggleDemo(): void {
    this.m_demo_mode = !this.m_demo_mode;
  }

  public SimulationLoop(): void {
    const time: number = Date.now();

    this.m_time_last = this.m_time_last || time;

    let time_elapsed: number = time - this.m_time_last;
    this.m_time_last = time;

    if (time_elapsed > 1000) { time_elapsed = 1000; } // clamp

    this.m_fps_time += time_elapsed;
    this.m_fps_frames++;

    if (this.m_fps_time >= 500) {
      this.m_fps = (this.m_fps_frames * 1000) / this.m_fps_time;
      this.m_fps_frames = 0;
      this.m_fps_time = 0;

      this.m_fps_div.innerHTML = this.m_fps.toFixed(1).toString();
    }

    if (time_elapsed > 0) {
      const ctx: CanvasRenderingContext2D = this.m_ctx;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.strokeStyle = "blue";
      ctx.strokeRect(this.m_mouse.x - 24, this.m_mouse.y - 24, 48, 48);

      const mouse_world: box2d.b2Vec2 = g_camera.ConvertScreenToWorld(this.m_mouse, new box2d.b2Vec2());

      ctx.save();

        // 0,0 at center of canvas, x right, y up
        ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height);
        ctx.scale(1, -1);
        ///ctx.scale(g_camera.m_extent, g_camera.m_extent);
        ///ctx.lineWidth /= g_camera.m_extent;
        const s: number = 0.5 * g_camera.m_height / g_camera.m_extent;
        ctx.scale(s, s);
        ctx.lineWidth /= s;

        // apply camera
        ctx.scale(1 / g_camera.m_zoom, 1 / g_camera.m_zoom);
        ctx.lineWidth *= g_camera.m_zoom;
        ///ctx.rotate(-g_camera.m_roll.GetAngle());
        ctx.translate(-g_camera.m_center.x, -g_camera.m_center.y);

        this.m_test.Step(this.m_settings);

        ///#if B2_ENABLE_PARTICLE
        // Update the state of the particle parameter.
        let restartTest = [false];
        Main.particleParameter.Changed(restartTest);
        ///#endif

        ///#if B2_ENABLE_PARTICLE
        let msg = g_testEntries[this.m_test_index].name;
        if (Main.fullscreenUI.GetParticleParameterSelectionEnabled()) {
          msg += " : ";
          msg += Main.particleParameter.GetName();
        }
        this.m_test.DrawTitle(msg);
        ///#else
        ///this.m_test.DrawTitle(g_testEntries[this.m_test_index].name);
        ///#endif

        ctx.strokeStyle = "yellow";
        ctx.strokeRect(mouse_world.x - 0.5, mouse_world.y - 0.5, 1.0, 1.0);

      ctx.restore();

      ///#if B2_ENABLE_PARTICLE
      if (restartTest[0]) {
        this.LoadTest(true);
      }
      ///#endif

      this.UpdateTest(time_elapsed);
    }
  }

  ///#if B2_ENABLE_PARTICLE

  /**
   * Set whether to restart the test on particle parameter
   * changes. This parameter is re-enabled when the test changes.
   */
  static SetRestartOnParticleParameterChange(enable: boolean): void {
    Main.particleParameter.SetRestartOnChange(enable);
  }

  /**
   * Set the currently selected particle parameter value.  This
   * value must match one of the values in
   * Main::k_particleTypes or one of the values referenced by
   * particleParameterDef passed to SetParticleParameters().
   */
  static SetParticleParameterValue(value: number): number {
    const index = Main.particleParameter.FindIndexByValue(value);
    // If the particle type isn't found, so fallback to the first entry in the
    // parameter.
    Main.particleParameter.Set(index >= 0 ? index : 0);
    return Main.particleParameter.GetValue();
  }

  /**
   * Get the currently selected particle parameter value and
   * enable particle parameter selection arrows on Android.
   */
  static GetParticleParameterValue(): number {
    // Enable display of particle type selection arrows.
    Main.fullscreenUI.SetParticleParameterSelectionEnabled(true);
    return Main.particleParameter.GetValue();
  }

  /**
   * Override the default particle parameters for the test.
   */
  static SetParticleParameters(particleParameterDef: ParticleParameter.Definition[], particleParameterDefCount: number = particleParameterDef.length) {
    Main.particleParameter.SetDefinition(particleParameterDef, particleParameterDefCount);
  }

  ///#endif
}
