import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ContractData,
  ProductSelection,
  PricingOption,
  PaymentMethod,
  DeliveryOption,
} from '@/types/contract';

interface ArticlesSectionProps {
  data: ContractData;
  onUpdate: (partial: Partial<ContractData>) => void;
  readOnly?: boolean;
}

const ArticlesSection: React.FC<ArticlesSectionProps> = ({ data, onUpdate, readOnly }) => {
  const updateProduits = (p: Partial<ProductSelection>) =>
    onUpdate({ produits: { ...data.produits, ...p } });
  const updatePrix = (p: Partial<PricingOption>) =>
    onUpdate({ prix: { ...data.prix, ...p } });
  const updatePaiement = (p: Partial<PaymentMethod>) =>
    onUpdate({ paiement: { ...data.paiement, ...p } });
  const updateLivraison = (p: Partial<DeliveryOption>) =>
    onUpdate({ livraison: { ...data.livraison, ...p } });

  const sectionClass = 'rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in shadow-contract';
  const articleTitle = 'font-display text-base font-semibold text-foreground';

  return (
    <div className="space-y-5">
      {/* Article 1 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>📋 Article 1 : Objet du contrat</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          La vente en ligne des articles confectionnés par la Fournisseuse via la boutique virtuelle de la Distributrice.
        </p>
      </div>

      {/* Article 2 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>👗 Article 2 : Produits concernés</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(['robes', 'jupes', 'chemises', 'ensembles'] as const).map(p => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={data.produits[p]}
                onCheckedChange={v => updateProduits({ [p]: !!v })}
                disabled={readOnly}
              />
              <span className="text-sm capitalize">{p}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={data.produits.autres}
              onCheckedChange={v => updateProduits({ autres: !!v })}
              disabled={readOnly}
            />
            <span className="text-sm">Autres</span>
          </label>
        </div>
        {data.produits.autres && (
          <Input
            value={data.produits.autresDetail}
            onChange={e => updateProduits({ autresDetail: e.target.value })}
            disabled={readOnly}
            placeholder="Précisez les autres produits..."
            className="mt-2"
          />
        )}
      </div>

      {/* Article 3 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>💰 Article 3 : Prix et bénéfices</h3>
        <RadioGroup
          value={data.prix.type}
          onValueChange={v => updatePrix({ type: v as 'marge' | 'commission' })}
          disabled={readOnly}
          className="space-y-3"
        >
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="marge" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium">Prix de base + Marge</p>
              <p className="text-xs text-muted-foreground">La Fournisseuse fixe un prix de base et la Distributrice ajoute sa marge</p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="commission" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium">Commission (%)</p>
              <p className="text-xs text-muted-foreground">La Distributrice reçoit une commission sur les ventes</p>
            </div>
          </label>
        </RadioGroup>
        {data.prix.type === 'commission' && (
          <div className="flex items-center gap-2 mt-2">
            <Label>Commission :</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={data.prix.commissionPercent}
              onChange={e => updatePrix({ commissionPercent: Number(e.target.value) })}
              disabled={readOnly}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>

      {/* Article 4 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>💳 Article 4 : Modalités de paiement</h3>
        <p className="text-sm font-medium text-foreground mb-2">Mobile Money :</p>
        <div className="flex flex-wrap gap-4">
          {[
            { key: 'mvola' as const, label: 'MVola' },
            { key: 'orangeMoney' as const, label: 'Orange Money' },
            { key: 'airtelMoney' as const, label: 'Airtel Money' },
          ].map(m => (
            <label key={m.key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={data.paiement[m.key]}
                onCheckedChange={v => updatePaiement({ [m.key]: !!v })}
                disabled={readOnly}
              />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg space-y-1">
          <p>• Acompte de 50% payé dans les 3 jours avant livraison</p>
          <p>• Solde payé le jour de la livraison</p>
        </div>
      </div>

      {/* Article 5 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>🚚 Article 5 : Livraison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-medium">Qui assure la livraison ?</Label>
            <RadioGroup
              value={data.livraison.responsable}
              onValueChange={v => updateLivraison({ responsable: v as any })}
              disabled={readOnly}
              className="space-y-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="fournisseuse" />
                <span className="text-sm">Fournisseuse</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="distributrice" />
                <span className="text-sm">Distributrice</span>
              </label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Qui paie les frais ?</Label>
            <RadioGroup
              value={data.livraison.fraisPayePar}
              onValueChange={v => updateLivraison({ fraisPayePar: v as any })}
              disabled={readOnly}
              className="space-y-2"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="client" />
                <span className="text-sm">Client</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="distributrice" />
                <span className="text-sm">Distributrice</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="fournisseuse" />
                <span className="text-sm">Fournisseuse</span>
              </label>
            </RadioGroup>
          </div>
        </div>
      </div>

      {/* Article 6 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>⚖️ Article 6 : Responsabilités</h3>
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
          <p>• La Fournisseuse s'engage à fournir des articles de qualité conforme aux descriptions.</p>
          <p>• La Distributrice s'engage à représenter fidèlement les articles sur sa boutique en ligne.</p>
          <p>• En cas de litige, les parties s'engagent à trouver une solution amiable.</p>
          <p>• La Fournisseuse est responsable des défauts de fabrication.</p>
          <p>• La Distributrice est responsable de la communication avec les clients.</p>
        </div>
      </div>

      {/* Article 7 */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>📅 Article 7 : Durée</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
          Contrat valable 12 mois à compter de la date de validation.
        </p>
      </div>

      {/* Lieu et date */}
      <div className={sectionClass}>
        <h3 className={articleTitle}>📍 Lieu et date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Lieu *</Label>
            <Input
              value={data.lieu}
              onChange={e => onUpdate({ lieu: e.target.value })}
              disabled={readOnly}
              placeholder="Ville ou commune"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={data.date}
              onChange={e => onUpdate({ date: e.target.value })}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesSection;
