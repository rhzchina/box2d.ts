/*
 * Copyright (c) 2013 Google, Inc.
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
System.register(["../Common/b2Math", "../Common/b2Draw"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var b2Math_1, b2Draw_1, b2ParticleGroupFlag, b2ParticleGroupDef, b2ParticleGroup;
    return {
        setters: [
            function (b2Math_1_1) {
                b2Math_1 = b2Math_1_1;
            },
            function (b2Draw_1_1) {
                b2Draw_1 = b2Draw_1_1;
            }
        ],
        execute: function () {
            (function (b2ParticleGroupFlag) {
                /// Prevents overlapping or leaking.
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_solidParticleGroup"] = 1] = "b2_solidParticleGroup";
                /// Keeps its shape.
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_rigidParticleGroup"] = 2] = "b2_rigidParticleGroup";
                /// Won't be destroyed if it gets empty.
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_particleGroupCanBeEmpty"] = 4] = "b2_particleGroupCanBeEmpty";
                /// Will be destroyed on next simulation step.
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_particleGroupWillBeDestroyed"] = 8] = "b2_particleGroupWillBeDestroyed";
                /// Updates depth data on next simulation step.
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_particleGroupNeedsUpdateDepth"] = 16] = "b2_particleGroupNeedsUpdateDepth";
                b2ParticleGroupFlag[b2ParticleGroupFlag["b2_particleGroupInternalMask"] = 24] = "b2_particleGroupInternalMask";
            })(b2ParticleGroupFlag || (b2ParticleGroupFlag = {}));
            exports_1("b2ParticleGroupFlag", b2ParticleGroupFlag);
            b2ParticleGroupDef = class b2ParticleGroupDef {
                constructor() {
                    this.flags = 0;
                    this.groupFlags = 0;
                    this.position = new b2Math_1.b2Vec2();
                    this.angle = 0.0;
                    this.linearVelocity = new b2Math_1.b2Vec2();
                    this.angularVelocity = 0.0;
                    this.color = new b2Draw_1.b2Color();
                    this.strength = 1.0;
                    this.shape = null;
                    this.shapes = null;
                    this.shapeCount = 0;
                    this.stride = 0;
                    this.particleCount = 0;
                    this.positionData = null;
                    this.lifetime = 0;
                    this.userData = null;
                    this.group = null;
                }
            };
            exports_1("b2ParticleGroupDef", b2ParticleGroupDef);
            b2ParticleGroup = class b2ParticleGroup {
                constructor(system) {
                    this.m_system = null;
                    this.m_firstIndex = 0;
                    this.m_lastIndex = 0;
                    this.m_groupFlags = 0;
                    this.m_strength = 1.0;
                    this.m_prev = null;
                    this.m_next = null;
                    this.m_timestamp = -1;
                    this.m_mass = 0.0;
                    this.m_inertia = 0.0;
                    this.m_center = new b2Math_1.b2Vec2();
                    this.m_linearVelocity = new b2Math_1.b2Vec2();
                    this.m_angularVelocity = 0.0;
                    this.m_transform = new b2Math_1.b2Transform();
                    ///m_transform.SetIdentity();
                    this.m_userData = null;
                    this.m_system = system;
                }
                GetNext() {
                    return this.m_next;
                }
                GetParticleSystem() {
                    return this.m_system;
                }
                GetParticleCount() {
                    return this.m_lastIndex - this.m_firstIndex;
                }
                GetBufferIndex() {
                    return this.m_firstIndex;
                }
                ContainsParticle(index) {
                    return this.m_firstIndex <= index && index < this.m_lastIndex;
                }
                GetAllParticleFlags() {
                    let flags = 0;
                    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
                        flags |= this.m_system.m_flagsBuffer.data[i];
                    }
                    return flags;
                }
                GetGroupFlags() {
                    return this.m_groupFlags;
                }
                SetGroupFlags(flags) {
                    ///b2Assert((flags & b2ParticleGroupFlag.b2_particleGroupInternalMask) === 0);
                    flags |= this.m_groupFlags & b2ParticleGroupFlag.b2_particleGroupInternalMask;
                    this.m_system.SetGroupFlags(this, flags);
                }
                GetMass() {
                    this.UpdateStatistics();
                    return this.m_mass;
                }
                GetInertia() {
                    this.UpdateStatistics();
                    return this.m_inertia;
                }
                GetCenter() {
                    this.UpdateStatistics();
                    return this.m_center;
                }
                GetLinearVelocity() {
                    this.UpdateStatistics();
                    return this.m_linearVelocity;
                }
                GetAngularVelocity() {
                    this.UpdateStatistics();
                    return this.m_angularVelocity;
                }
                GetTransform() {
                    return this.m_transform;
                }
                GetPosition() {
                    return this.m_transform.p;
                }
                GetAngle() {
                    return this.m_transform.q.GetAngle();
                }
                GetLinearVelocityFromWorldPoint(worldPoint, out) {
                    const s_t0 = b2ParticleGroup.GetLinearVelocityFromWorldPoint_s_t0;
                    this.UpdateStatistics();
                    ///  return m_linearVelocity + b2Cross(m_angularVelocity, worldPoint - m_center);
                    return b2Math_1.b2Vec2.AddVCrossSV(this.m_linearVelocity, this.m_angularVelocity, b2Math_1.b2Vec2.SubVV(worldPoint, this.m_center, s_t0), out);
                }
                GetUserData() {
                    return this.m_userData;
                }
                SetUserData(data) {
                    this.m_userData = data;
                }
                ApplyForce(force) {
                    this.m_system.ApplyForce(this.m_firstIndex, this.m_lastIndex, force);
                }
                ApplyLinearImpulse(impulse) {
                    this.m_system.ApplyLinearImpulse(this.m_firstIndex, this.m_lastIndex, impulse);
                }
                DestroyParticles(callDestructionListener) {
                    ///b2Assert(this.m_system.m_world.IsLocked() === false);
                    if (this.m_system.m_world.IsLocked()) {
                        return;
                    }
                    for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
                        this.m_system.DestroyParticle(i, callDestructionListener);
                    }
                }
                UpdateStatistics() {
                    const p = new b2Math_1.b2Vec2();
                    const v = new b2Math_1.b2Vec2();
                    if (this.m_timestamp !== this.m_system.m_timestamp) {
                        const m = this.m_system.GetParticleMass();
                        ///  this.m_mass = 0;
                        this.m_mass = m * (this.m_lastIndex - this.m_firstIndex);
                        this.m_center.SetZero();
                        this.m_linearVelocity.SetZero();
                        for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
                            ///  this.m_mass += m;
                            ///  this.m_center += m * this.m_system.m_positionBuffer.data[i];
                            this.m_center.SelfMulAdd(m, this.m_system.m_positionBuffer.data[i]);
                            ///  this.m_linearVelocity += m * this.m_system.m_velocityBuffer.data[i];
                            this.m_linearVelocity.SelfMulAdd(m, this.m_system.m_velocityBuffer.data[i]);
                        }
                        if (this.m_mass > 0) {
                            const inv_mass = 1 / this.m_mass;
                            ///this.m_center *= 1 / this.m_mass;
                            this.m_center.SelfMul(inv_mass);
                            ///this.m_linearVelocity *= 1 / this.m_mass;
                            this.m_linearVelocity.SelfMul(inv_mass);
                        }
                        this.m_inertia = 0;
                        this.m_angularVelocity = 0;
                        for (let i = this.m_firstIndex; i < this.m_lastIndex; i++) {
                            ///b2Vec2 p = this.m_system.m_positionBuffer.data[i] - this.m_center;
                            b2Math_1.b2Vec2.SubVV(this.m_system.m_positionBuffer.data[i], this.m_center, p);
                            ///b2Vec2 v = this.m_system.m_velocityBuffer.data[i] - this.m_linearVelocity;
                            b2Math_1.b2Vec2.SubVV(this.m_system.m_velocityBuffer.data[i], this.m_linearVelocity, v);
                            this.m_inertia += m * b2Math_1.b2Vec2.DotVV(p, p);
                            this.m_angularVelocity += m * b2Math_1.b2Vec2.CrossVV(p, v);
                        }
                        if (this.m_inertia > 0) {
                            this.m_angularVelocity *= 1 / this.m_inertia;
                        }
                        this.m_timestamp = this.m_system.m_timestamp;
                    }
                }
            };
            b2ParticleGroup.GetLinearVelocityFromWorldPoint_s_t0 = new b2Math_1.b2Vec2();
            exports_1("b2ParticleGroup", b2ParticleGroup);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYjJQYXJ0aWNsZUdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYjJQYXJ0aWNsZUdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHOzs7Ozs7Ozs7Ozs7Ozs7WUFVSCxXQUFZLG1CQUFtQjtnQkFDN0Isb0NBQW9DO2dCQUNwQywrRkFBOEIsQ0FBQTtnQkFDOUIsb0JBQW9CO2dCQUNwQiwrRkFBOEIsQ0FBQTtnQkFDOUIsd0NBQXdDO2dCQUN4Qyx5R0FBbUMsQ0FBQTtnQkFDbkMsOENBQThDO2dCQUM5QyxtSEFBd0MsQ0FBQTtnQkFDeEMsK0NBQStDO2dCQUMvQyxzSEFBeUMsQ0FBQTtnQkFFekMsOEdBQWlHLENBQUE7WUFDbkcsQ0FBQyxFQWJXLG1CQUFtQixLQUFuQixtQkFBbUIsUUFhOUI7O1lBRUQscUJBQUE7Z0JBQUE7b0JBQ0UsVUFBSyxHQUFtQixDQUFDLENBQUM7b0JBQzFCLGVBQVUsR0FBd0IsQ0FBQyxDQUFDO29CQUNwQyxhQUFRLEdBQVcsSUFBSSxlQUFNLEVBQUUsQ0FBQztvQkFDaEMsVUFBSyxHQUFXLEdBQUcsQ0FBQztvQkFDcEIsbUJBQWMsR0FBVyxJQUFJLGVBQU0sRUFBRSxDQUFDO29CQUN0QyxvQkFBZSxHQUFXLEdBQUcsQ0FBQztvQkFDOUIsVUFBSyxHQUFZLElBQUksZ0JBQU8sRUFBRSxDQUFDO29CQUMvQixhQUFRLEdBQVcsR0FBRyxDQUFDO29CQUN2QixVQUFLLEdBQVksSUFBSSxDQUFDO29CQUN0QixXQUFNLEdBQWMsSUFBSSxDQUFDO29CQUN6QixlQUFVLEdBQVcsQ0FBQyxDQUFDO29CQUN2QixXQUFNLEdBQVcsQ0FBQyxDQUFDO29CQUNuQixrQkFBYSxHQUFXLENBQUMsQ0FBQztvQkFDMUIsaUJBQVksR0FBYSxJQUFJLENBQUM7b0JBQzlCLGFBQVEsR0FBVyxDQUFDLENBQUM7b0JBQ3JCLGFBQVEsR0FBUSxJQUFJLENBQUM7b0JBQ3JCLFVBQUssR0FBMkIs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