/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
System.register(["../../Box2D/Box2D", "../Testbed"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var box2d, testbed, MotorJoint;
    return {
        setters: [
            function (box2d_1) {
                box2d = box2d_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            }
        ],
        execute: function () {
            MotorJoint = class MotorJoint extends testbed.Test {
                constructor() {
                    super();
                    this.m_time = 0;
                    this.m_go = false;
                    let ground = null;
                    {
                        const bd = new box2d.b2BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        ground.CreateFixture(fd);
                    }
                    // Define motorized body
                    {
                        const bd = new box2d.b2BodyDef();
                        bd.type = box2d.b2BodyType.b2_dynamicBody;
                        bd.position.Set(0.0, 8.0);
                        /*b2Body*/
                        const body = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2PolygonShape();
                        shape.SetAsBox(2.0, 0.5);
                        const fd = new box2d.b2FixtureDef();
                        fd.shape = shape;
                        fd.friction = 0.6;
                        fd.density = 2.0;
                        body.CreateFixture(fd);
                        const mjd = new box2d.b2MotorJointDef();
                        mjd.Initialize(ground, body);
                        mjd.maxForce = 1000.0;
                        mjd.maxTorque = 1000.0;
                        this.m_joint = /** @type {box2d.b2MotorJoint} */ (this.m_world.CreateJoint(mjd));
                    }
                    this.m_go = false;
                    this.m_time = 0.0;
                }
                Keyboard(key) {
                    switch (key) {
                        case "s":
                            this.m_go = !this.m_go;
                            break;
                    }
                }
                Step(settings) {
                    if (this.m_go && settings.hz > 0.0) {
                        this.m_time += 1.0 / settings.hz;
                    }
                    /*b2Vec2*/
                    const linearOffset = new box2d.b2Vec2();
                    linearOffset.x = 6.0 * box2d.b2Sin(2.0 * this.m_time);
                    linearOffset.y = 8.0 + 4.0 * box2d.b2Sin(1.0 * this.m_time);
                    /*float32*/
                    const angularOffset = 4.0 * this.m_time;
                    this.m_joint.SetLinearOffset(linearOffset);
                    this.m_joint.SetAngularOffset(angularOffset);
                    testbed.g_debugDraw.DrawPoint(linearOffset, 4.0, new box2d.b2Color(0.9, 0.9, 0.9));
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: (s) pause");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new MotorJoint();
                }
            };
            exports_1("MotorJoint", MotorJoint);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW90b3JKb2ludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1vdG9ySm9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7Ozs7Ozs7Ozs7Ozs7OztZQUtGLGFBQUEsZ0JBQXdCLFNBQVEsT0FBTyxDQUFDLElBQUk7Z0JBSzFDO29CQUNFLEtBQUssRUFBRSxDQUFDO29CQUpWLFdBQU0sR0FBRyxDQUFDLENBQUM7b0JBQ1gsU0FBSSxHQUFHLEtBQUssQ0FBQztvQkFLWCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBRWxCO3dCQUNFLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBRXJDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBRXJFLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO3dCQUNwQyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzt3QkFFakIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDMUI7b0JBRUQsd0JBQXdCO29CQUN4Qjt3QkFDRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDakMsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQzt3QkFDMUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENB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