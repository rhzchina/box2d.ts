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
    var box2d, testbed, ShapeEditing;
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
            ShapeEditing = class ShapeEditing extends testbed.Test {
                constructor() {
                    super();
                    this.m_body = null;
                    this.m_fixture1 = null;
                    this.m_fixture2 = null;
                    this.m_sensor = false;
                    {
                        const bd = new box2d.b2BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        const shape = new box2d.b2EdgeShape();
                        shape.Set(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(40.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    const bd = new box2d.b2BodyDef();
                    bd.type = box2d.b2BodyType.b2_dynamicBody;
                    bd.position.Set(0.0, 10.0);
                    this.m_body = this.m_world.CreateBody(bd);
                    const shape = new box2d.b2PolygonShape();
                    shape.SetAsBox(4.0, 4.0, new box2d.b2Vec2(0.0, 0.0), 0.0);
                    this.m_fixture1 = this.m_body.CreateFixture(shape, 10.0);
                    this.m_fixture2 = null;
                    this.m_sensor = false;
                }
                Keyboard(key) {
                    switch (key) {
                        case "c":
                            if (this.m_fixture2 === null) {
                                const shape = new box2d.b2CircleShape();
                                shape.m_radius = 3.0;
                                shape.m_p.Set(0.5, -4.0);
                                this.m_fixture2 = this.m_body.CreateFixture(shape, 10.0);
                                this.m_body.SetAwake(true);
                            }
                            break;
                        case "d":
                            if (this.m_fixture2 !== null) {
                                this.m_body.DestroyFixture(this.m_fixture2);
                                this.m_fixture2 = null;
                                this.m_body.SetAwake(true);
                            }
                            break;
                        case "s":
                            if (this.m_fixture2 !== null) {
                                this.m_sensor = !this.m_sensor;
                                this.m_fixture2.SetSensor(this.m_sensor);
                            }
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Press: (c) create a shape, (d) destroy a shape.");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, `sensor = ${(this.m_sensor) ? (1) : (0)}`);
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new ShapeEditing();
                }
            };
            exports_1("ShapeEditing", ShapeEditing);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcGVFZGl0aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2hhcGVFZGl0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7Ozs7Ozs7Ozs7WUFLRixlQUFBLGtCQUEwQixTQUFRLE9BQU8sQ0FBQyxJQUFJO2dCQU01QztvQkFDRSxLQUFLLEVBQUUsQ0FBQztvQkFOVixXQUFNLEdBQWlCLElBQUksQ0FBQztvQkFDNUIsZUFBVSxHQUFvQixJQUFJLENBQUM7b0JBQ25DLGVBQVUsR0FBb0IsSUFBSSxDQUFDO29CQUNuQyxhQUFRLEdBQUcsS0FBSyxDQUFDO29CQUtmO3dCQUNFLE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFFM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQ3RDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDckUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQ2xDO29CQUVELE1BQU0sRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNqQyxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO29CQUMxQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFD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