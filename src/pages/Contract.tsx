import React, { useState, useCallback } from 'react';
import { Role, ContractData, initialContractData, PartyInfo, DistributorInfo, CINPhotos } from '@/types/contract';
import PartyForm from '@/components/PartyForm';
import ArticlesSection from '@/components/ArticlesSection';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateContractPDF } from '@/utils/generatePDF';
import { Download, CheckCircle2, Shield, ArrowLeft, Scissors, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ContractPage: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [contract, setContract] = useState<ContractData>({ ...initialContractData });

  const updateContract = useCallback((partial: Partial<ContractData>) => {
    if (contract.status === 'valide') return;
    setContract(prev => ({ ...prev, ...partial }));
  }, [contract.status]);

  const updateParty = useCallback((party: 'fournisseuse' | 'distributrice', partial: Partial<PartyInfo> | Partial<DistributorInfo>) => {
    if (contract.status === 'valide') return;
    setContract(prev => ({
      ...prev,
      [party]: { ...prev[party], ...partial },
    }));
  }, [contract.status]);

  const verifyCIN = useCallback(async (party: 'fournisseuse' | 'distributrice', side: 'recto' | 'verso', imageBase64: string) => {
    // Set verifying status
    setContract(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        cinPhotos: {
          ...prev[party].cinPhotos,
          [`${side}Status`]: 'verifying',
          [`${side}Error`]: null,
        },
      },
    }));

    try {
      const { data, error } = await supabase.functions.invoke('verify-cin', {
        body: { imageBase64 },
      });

      if (error) throw error;

      const isValid = data?.valid === true;
      setContract(prev => ({
        ...prev,
        [party]: {
          ...prev[party],
          cinPhotos: {
            ...prev[party].cinPhotos,
            [`${side}Status`]: isValid ? 'valid' : 'invalid',
            [`${side}Error`]: isValid ? null : (data?.reason || 'La photo fournie n\'est pas une Carte d\'Identité Nationale valide'),
          },
        },
      }));

      if (isValid) {
        toast.success(`CIN ${side} vérifiée avec succès`);
      } else {
        toast.error(`CIN ${side} non valide`, { description: data?.reason });
      }
    } catch (err) {
      console.error('CIN verification error:', err);
      setContract(prev => ({
        ...prev,
        [party]: {
          ...prev[party],
          cinPhotos: {
            ...prev[party].cinPhotos,
            [`${side}Status`]: 'invalid',
            [`${side}Error`]: 'Erreur lors de la vérification. Veuillez réessayer.',
          },
        },
      }));
      toast.error('Erreur de vérification CIN');
    }
  }, []);

  const computeStatus = useCallback(() => {
    if (contract.status === 'valide') return 'valide';
    if (contract.validationFournisseuse || contract.validationDistributrice) return 'en_attente';
    return 'brouillon';
  }, [contract]);

  const isPartyComplete = (info: PartyInfo, isDistrib = false) => {
    const base = info.nomComplet && info.cin;
    if (isDistrib) return base && (info as DistributorInfo).nomPage;
    return base;
  };

  const isCINValid = (photos: CINPhotos) =>
    photos.rectoStatus === 'valid' && photos.versoStatus === 'valid';

  const allCINValid =
    isCINValid(contract.fournisseuse.cinPhotos) &&
    isCINValid(contract.distributrice.cinPhotos);

  const allFieldsComplete =
    isPartyComplete(contract.fournisseuse) &&
    isPartyComplete(contract.distributrice, true) &&
    contract.lieu &&
    contract.date &&
    (contract.produits.robes || contract.produits.jupes || contract.produits.chemises || contract.produits.ensembles || contract.produits.autres) &&
    (contract.paiement.mvola || contract.paiement.orangeMoney || contract.paiement.airtelMoney);

  const canValidate =
    allFieldsComplete &&
    allCINValid &&
    contract.validationFournisseuse &&
    contract.validationDistributrice &&
    contract.status !== 'valide';

  const handleValidate = () => {
    if (!canValidate) return;
    setContract(prev => ({
      ...prev,
      status: 'valide',
      dateValidation: new Date().toISOString(),
    }));
    toast.success('Contrat validé avec succès !', {
      description: 'Le contrat est maintenant définitif et peut être téléchargé.',
    });
  };

  const handleDownload = () => {
    generateContractPDF(contract);
    toast.success('PDF téléchargé !');
  };

  const isReadOnly = contract.status === 'valide';
  const displayStatus = computeStatus();

  // Role selection screen
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-8 text-center animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-6">
              <ShieldCheck size={16} className="text-accent" />
              <span className="text-sm font-medium text-foreground">Contrat sécurisé avec vérification CIN</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Contrat de Vente en Ligne
            </h1>
            <p className="text-muted-foreground">
              Sélectionnez votre rôle pour remplir le contrat.<br />
              <span className="text-xs">Les photos CIN seront vérifiées automatiquement par IA.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setRole('fournisseuse')}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
            >
              <div className="w-12 h-12 rounded-lg gradient-navy flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                <Scissors size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Fournisseuse</h3>
              <p className="text-sm text-muted-foreground">Couturière qui confectionne les articles</p>
            </button>

            <button
              onClick={() => setRole('distributrice')}
              className="group p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-contract-lg transition-all duration-300 text-left space-y-3"
            >
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center text-accent-foreground group-hover:scale-105 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">Distributrice</h3>
              <p className="text-sm text-muted-foreground">Vendeuse en ligne via boutique virtuelle</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setRole(null)}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">Contrat de Vente</h1>
              <p className="text-xs text-muted-foreground">
                Connecté en tant que : <span className="font-semibold capitalize">{role === 'fournisseuse' ? 'Fournisseuse' : 'Distributrice'}</span>
              </p>
            </div>
          </div>
          <StatusBadge status={displayStatus} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Fournisseuse section */}
        <PartyForm
          type="fournisseuse"
          data={contract.fournisseuse}
          onChange={partial => updateParty('fournisseuse', partial)}
          onVerifyCIN={(side, img) => verifyCIN('fournisseuse', side, img)}
          readOnly={isReadOnly || role !== 'fournisseuse'}
        />

        {/* Distributrice section */}
        <PartyForm
          type="distributrice"
          data={contract.distributrice}
          onChange={partial => updateParty('distributrice', partial)}
          onVerifyCIN={(side, img) => verifyCIN('distributrice', side, img)}
          readOnly={isReadOnly || role !== 'distributrice'}
        />

        {/* Articles */}
        <ArticlesSection data={contract} onUpdate={updateContract} readOnly={isReadOnly} />

        {/* CIN verification summary */}
        {!isReadOnly && (
          <div className={`rounded-xl border p-4 space-y-2 ${allCINValid ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className={allCINValid ? 'text-success' : 'text-warning'} />
              Vérification d'identité
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className={isCINValid(contract.fournisseuse.cinPhotos) ? 'text-success' : 'text-muted-foreground'}>
                  {isCINValid(contract.fournisseuse.cinPhotos) ? '✓' : '○'} CIN Fournisseuse
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={isCINValid(contract.distributrice.cinPhotos) ? 'text-success' : 'text-muted-foreground'}>
                  {isCINValid(contract.distributrice.cinPhotos) ? '✓' : '○'} CIN Distributrice
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cross validation */}
        {!isReadOnly && (
          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6 space-y-4 animate-fade-in">
            <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 size={20} className="text-accent" />
              Vérification croisée
            </h3>

            {role === 'fournisseuse' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validationFournisseuse}
                  onCheckedChange={v => updateContract({ validationFournisseuse: !!v })}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations de la Distributrice sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant cette case, vous attestez avoir vérifié les informations de la Distributrice</p>
                </div>
              </label>
            )}

            {role === 'distributrice' && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors">
                <Checkbox
                  checked={contract.validationDistributrice}
                  onCheckedChange={v => updateContract({ validationDistributrice: !!v })}
                />
                <div>
                  <p className="text-sm font-medium">Je confirme que les informations de la Fournisseuse sont exactes</p>
                  <p className="text-xs text-muted-foreground mt-1">En cochant cette case, vous attestez avoir vérifié les informations de la Fournisseuse</p>
                </div>
              </label>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} />
              <span>
                {contract.validationFournisseuse && contract.validationDistributrice
                  ? 'Les deux parties ont confirmé. Le contrat peut être validé.'
                  : contract.validationFournisseuse
                    ? 'En attente de la confirmation de la Distributrice.'
                    : contract.validationDistributrice
                      ? 'En attente de la confirmation de la Fournisseuse.'
                      : 'Les deux parties doivent confirmer les informations pour valider le contrat.'}
              </span>
            </div>
          </div>
        )}

        {/* Dates info when validated */}
        {isReadOnly && contract.dateValidation && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm space-y-1">
            <p className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 size={16} /> Contrat validé — Identité vérifiée
            </p>
            <p className="text-muted-foreground">Créé le : {new Date(contract.dateCreation).toLocaleDateString('fr-FR')}</p>
            <p className="text-muted-foreground">Validé le : {new Date(contract.dateValidation).toLocaleDateString('fr-FR')}</p>
          </div>
        )}
      </main>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-xs">
            {!isReadOnly && !allFieldsComplete && (
              <p className="text-muted-foreground">Remplissez tous les champs obligatoires</p>
            )}
            {!isReadOnly && allFieldsComplete && !allCINValid && (
              <p className="text-destructive">Les CIN recto/verso des deux parties doivent être vérifiées</p>
            )}
            {!isReadOnly && allFieldsComplete && allCINValid && !canValidate && (
              <p className="text-warning">En attente de la confirmation des deux parties</p>
            )}
            {isReadOnly && <p className="text-success font-medium">Contrat validé ✓</p>}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!isReadOnly && (
              <Button
                onClick={handleValidate}
                disabled={!canValidate}
                className="gradient-navy text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 size={16} className="mr-1.5" />
                Valider le contrat
              </Button>
            )}
            <Button
              onClick={handleDownload}
              disabled={contract.status !== 'valide'}
              variant="outline"
              className={contract.status === 'valide' ? 'border-accent text-accent-foreground hover:bg-accent/10' : ''}
            >
              <Download size={16} className="mr-1.5" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
