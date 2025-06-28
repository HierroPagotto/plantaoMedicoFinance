import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

type Step = 'request' | 'verify' | 'change' | 'success';

export default function PasswordReset() {
    const [step, setStep] = useState<Step>('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.requestPasswordReset(email);
            setSuccess('Código de recuperação enviado para seu email');
            setStep('verify');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao solicitar código de recuperação');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.verifyPasswordResetCode(email, code);
            if (response.valid) {
                setStep('change');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Código inválido ou expirado');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }
        
        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }
        
        try {
            await api.changePassword(email, code, newPassword);
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('request');
        setEmail('');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
                    <CardDescription>
                        {step === 'request' && 'Digite seu email para receber um código de recuperação'}
                        {step === 'verify' && 'Digite o código enviado para seu email'}
                        {step === 'change' && 'Digite sua nova senha'}
                        {step === 'success' && 'Senha alterada com sucesso!'}
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {error && (
                        <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                            <AlertDescription className="text-red-800 dark:text-red-200">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Step 1: Request Code */}
                    {step === 'request' && (
                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Enviar Código
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Verify Code */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Código de Verificação</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    'Verificar Código'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 3: Change Password */}
                    {step === 'change' && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova Senha</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Digite sua nova senha"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirme sua nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Alterando...
                                    </>
                                ) : (
                                    'Alterar Senha'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Success Step */}
                    {step === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-green-600 dark:text-green-400 font-medium">
                                Sua senha foi alterada com sucesso!
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/login">Ir para o Login</Link>
                            </Button>
                        </div>
                    )}

                    {/* Navigation */}
                    {step !== 'request' && step !== 'success' && (
                        <div className="mt-4 text-center">
                            <Button
                                variant="ghost"
                                onClick={resetForm}
                                className="text-sm text-gray-600 dark:text-gray-400"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar ao início
                            </Button>
                        </div>
                    )}

                    {step === 'request' && (
                        <div className="mt-4 text-center">
                            <Button variant="ghost" asChild className="text-sm text-gray-600 dark:text-gray-400">
                                <Link to="/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar ao Login
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 